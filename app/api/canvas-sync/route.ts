import { NextResponse } from "next/server";

function analyzeAssignment(
  title: string,
  description: string,
  points: number
) {
  const text =
    `${title} ${description}`.toLowerCase();

  const cleanText =
    description
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const wordCount =
    cleanText
      .split(/\s+/)
      .filter(Boolean)
      .length;

  /*
   * Default assignment
   */
  let difficulty = 3;
  let time = 20;
  let category = "Homework/Quiz";

  /*
   * Reading instructions
   */
  time += Math.floor(wordCount / 100) * 10;

  /*
   * QUIZZES
   */
  if (text.includes("quiz")) {
    difficulty += 2;
    time += 15;
    category = "Quiz";
  }

  /*
   * TESTS / EXAMS
   */
  if (
    text.includes("test") ||
    text.includes("exam")
  ) {
    difficulty += 3;
    time += 60;
    category = "Test";
  }

  /*
   * WRITING
   */
  if (
    text.includes("essay") ||
    text.includes("reflection") ||
    text.includes("written response")
  ) {
    difficulty += 1;
    time += 35;
  }

  /*
   * RESEARCH
   */
  if (
    text.includes("research") ||
    text.includes("sources") ||
    text.includes("cite") ||
    text.includes("citation")
  ) {
    difficulty += 3;
    time += 60;
  }

  /*
   * PROJECTS
   */
  if (
    text.includes("project") ||
    text.includes("presentation") ||
    text.includes("prototype")
  ) {
    difficulty += 3;
    time += 90;
    category = "Project";
  }

  /*
   * ENGINEERING / CAD
   */
  if (
    text.includes("cad") ||
    text.includes("3d model") ||
    text.includes("3d modeling") ||
    text.includes("modeling") ||
    text.includes("autocad") ||
    text.includes("inventor") ||
    text.includes("revit") ||
    text.includes("bim")
  ) {
    difficulty += 2;
    time += 60;
    category = "Engineering";
  }

  /*
   * SYLLABUS / SIGN-OFF / FORMS
   *
   * These should ALWAYS be among the easiest.
   */
  if (
    text.includes("sign off") ||
    text.includes("sign-off") ||
    text.includes("acknowledgement") ||
    text.includes("acknowledgment") ||
    text.includes("agreement") ||
    text.includes("syllabus") ||
    text.includes("syllabus sign")
  ) {
    difficulty = 1;
    time = 5;
    category = "Form";
  }

  /*
   * Very short/simple assignments
   */
  if (
    wordCount < 50 &&
    !text.includes("project") &&
    !text.includes("essay") &&
    !text.includes("research") &&
    !text.includes("test") &&
    !text.includes("exam")
  ) {
    time = Math.min(time, 15);
  }

  /*
   * Point value
   */
  if (points >= 100) {
    difficulty += 2;
  } else if (points <= 5) {
    difficulty -= 1;
  }

  return {
    difficulty: Math.max(
      1,
      Math.min(10, difficulty)
    ),

    time: Math.max(
      5,
      Math.round(time)
    ),

    category
  };
}


/*
 * Get Canvas assignment attachments.
 */
function getFiles(assignment: any) {
  if (
    !assignment.attachments ||
    !Array.isArray(assignment.attachments)
  ) {
    return [];
  }

  return assignment.attachments.map(
    (file: any) => ({
      name:
        file.display_name ||
        file.filename ||
        "Attachment",

      url:
        file.url ||
        file.preview_url ||
        "",

      type:
        file.filename
          ?.split(".")
          .pop()
          ?.toLowerCase() ||
        "file"
    })
  );
}


/*
 * Get the student's submission.
 *
 * Canvas can return submission as:
 *
 * submission: {...}
 *
 * or sometimes:
 *
 * submission: [{...}]
 */
function getSubmission(
  assignment: any
) {
  if (
    Array.isArray(
      assignment.submission
    )
  ) {
    return (
      assignment.submission[0] ||
      null
    );
  }

  return (
    assignment.submission ||
    null
  );
}


/*
 * Safely get points earned.
 */
function getPointsEarned(
  submission: any
) {
  if (!submission) {
    return null;
  }

  if (
    submission.score === null ||
    submission.score === undefined
  ) {
    return null;
  }

  const score =
    Number(
      submission.score
    );

  if (
    Number.isNaN(score)
  ) {
    return null;
  }

  return score;
}


/*
 * Determine whether an assignment
 * should be considered submitted.
 *
 * Rules:
 *
 * 1. Canvas says submitted
 * 2. Canvas has a submitted_at timestamp
 * 3. Grade is greater than 1
 */
function determineSubmitted(
  submission: any,
  pointsEarned: number | null
) {
  /*
   * Explicit Canvas submission.
   */
  if (
    submission?.workflow_state ===
    "submitted"
  ) {
    return true;
  }

  /*
   * Canvas has a submission timestamp.
   */
  if (
    submission?.submitted_at
  ) {
    return true;
  }

  /*
   * Your requested fallback:
   *
   * If Canvas hasn't marked it submitted,
   * but the teacher has awarded more than
   * 1 point, consider it submitted.
   */
  if (
    pointsEarned !== null &&
    pointsEarned > 1
  ) {
    return true;
  }

  return false;
}


/*
 * MAIN CANVAS SYNC
 */
export async function POST(
  req: Request
) {
  try {

    const {
      accounts
    } = await req.json();


    /*
     * Make sure accounts exist.
     */
    if (
      !accounts ||
      !Array.isArray(accounts) ||
      accounts.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No Canvas accounts found"
        },
        {
          status: 400
        }
      );
    }


    const assignments: any[] = [];


    /*
     * Only import assignments from
     * August 1 of the current year onward.
     *
     * Example:
     * 2026-08-01
     */
    const now =
      new Date();

    const cutoff =
      new Date(
        now.getFullYear(),
        7,
        1,
        0,
        0,
        0,
        0
      ).getTime();


    /*
     * Process every Canvas account.
     */
    for (
      const account of accounts
    ) {

      if (
        !account?.url ||
        !account?.token
      ) {
        continue;
      }


      const baseUrl =
        account.url.replace(
          /\/$/,
          ""
        );


      /*
       * Get active courses.
       */
      const coursesUrl =
        `${baseUrl}/api/v1/courses` +
        `?enrollment_state=active` +
        `&per_page=100`;


      const coursesResponse =
        await fetch(
          coursesUrl,
          {
            headers: {
              Authorization:
                `Bearer ${account.token}`
            },

            cache: "no-store"
          }
        );


      if (
        !coursesResponse.ok
      ) {

        console.error(
          `Canvas courses failed for ${account.name}:`,
          coursesResponse.status
        );

        continue;
      }


      const courses =
        await coursesResponse.json();


      if (
        !Array.isArray(courses)
      ) {
        continue;
      }


      /*
       * Process each course.
       */
      for (
        const course
        of courses
      ) {

        if (
          !course?.id
        ) {
          continue;
        }


        /*
         * Get assignments.
         *
         * include[]=submission tells Canvas
         * to include the current student's
         * submission information.
         */
        const assignmentsUrl =
          `${baseUrl}/api/v1/courses/${course.id}/assignments` +
          `?include[]=submission` +
          `&per_page=100`;


        const response =
          await fetch(
            assignmentsUrl,
            {
              headers: {
                Authorization:
                  `Bearer ${account.token}`
              },

              cache: "no-store"
            }
          );


        if (
          !response.ok
        ) {

          console.error(
            `Assignments failed for ${course.name}:`,
            response.status
          );

          continue;
        }


        const canvasAssignments =
          await response.json();


        if (
          !Array.isArray(
            canvasAssignments
          )
        ) {
          continue;
        }


        /*
         * Process assignments.
         */
        for (
          const assignment
          of canvasAssignments
        ) {

          /*
           * Ignore invalid assignments.
           */
          if (
            !assignment?.id ||
            !assignment?.name
          ) {
            continue;
          }


          /*
           * Ignore assignments before
           * August 1.
           *
           * Assignments without a due date
           * are kept.
           */
          if (
            assignment.due_at
          ) {

            const due =
              new Date(
                assignment.due_at
              ).getTime();


            if (
              !Number.isNaN(due) &&
              due < cutoff
            ) {
              continue;
            }
          }


          /*
           * Get Canvas submission.
           */
          const submission =
            getSubmission(
              assignment
            );


          /*
           * Get grade.
           */
          const pointsEarned =
            getPointsEarned(
              submission
            );


          /*
           * Determine submitted state.
           */
          const submitted =
            determineSubmitted(
              submission,
              pointsEarned
            );


          /*
           * Missing assignment.
           */
          const missing =
            Boolean(
              submission?.missing
            ) &&
            !submitted;


          /*
           * Late assignment.
           */
          const late =
            Boolean(
              submission?.late
            );


          /*
           * Analyze assignment.
           */
          const analysis =
            analyzeAssignment(
              assignment.name,
              assignment.description ||
                "",
              Number(
                assignment.points_possible ||
                0
              )
            );


          /*
           * Stable ID.
           *
           * DO NOT use Date.now()
           * here.
           *
           * Canvas assignment IDs are stable.
           */
          const canvasId =
            assignment.id;


          const canvasKey =
            `${baseUrl}::${course.id}::${canvasId}`;


          /*
           * Build assignment object.
           */
          assignments.push({

            id:
              canvasId,

            canvasId,

            canvasKey,


            title:
              assignment.name,


            className:
              course.name ||
              "Unknown Class",


            courseId:
              course.id,


            description:
              assignment.description ||
              "No description",


            dueDate:
              assignment.due_at ||
              "No due date",


            difficulty:
              analysis.difficulty,


            estimatedTime:
              analysis.time,


            category:
              analysis.category,


            /*
             * IMPORTANT:
             *
             * Submitted assignments are
             * already completed.
             */
            completed:
              submitted,


            submitted,


            /*
             * Canvas submission information.
             */
            submittedAt:
              submission?.submitted_at ||
              null,


            submissionType:
              submission?.submission_type ||
              null,


            missing,


            late,


            /*
             * Grade information.
             */
            pointsPossible:
              Number(
                assignment.points_possible ||
                0
              ),


            pointsEarned,


            /*
             * Canvas link.
             */
            canvasUrl:
              assignment.html_url ||
              `${baseUrl}/courses/${course.id}/assignments/${assignment.id}`,


            /*
             * Files.
             */
            attachments:
              getFiles(
                assignment
              ),


            /*
             * Canvas account.
             */
            canvasAccount:
              account.name ||
              "Canvas",

            canvasBaseUrl:
              baseUrl

          });
        }
      }
    }


    /*
     * Remove duplicate Canvas assignments
     * before returning the data.
     *
     * This is important if two courses/accounts
     * happen to return the same assignment.
     */
    const unique =
      new Map<
        string,
        any
      >();


    for (
      const assignment
      of assignments
    ) {

      const key =
        assignment.canvasKey ||
        `${assignment.canvasAccount}::${assignment.canvasId}`;


      /*
       * Prefer the submitted version if
       * duplicates somehow exist.
       */
      const existing =
        unique.get(key);


      if (
        !existing ||
        (
          assignment.submitted &&
          !existing.submitted
        )
      ) {
        unique.set(
          key,
          assignment
        );
      }
    }


    const finalAssignments =
      Array.from(
        unique.values()
      );


    /*
     * Return everything to the app.
     */
    return NextResponse.json({
      assignments:
        finalAssignments,

      count:
        finalAssignments.length,

      syncedAt:
        new Date().toISOString()
    });

  }

  catch (
    error: any
  ) {

    console.error(
      "Canvas sync error:",
      error
    );


    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unknown Canvas sync error"
      },
      {
        status: 500
      }
    );
  }
}
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { accounts } = await req.json();

    if (!accounts || accounts.length === 0) {
      return NextResponse.json(
        {
          error: "No Canvas accounts found",
        },
        { status: 400 }
      );
    }

    const grades: any[] = [];

    for (const account of accounts) {
      const baseUrl = account.url.replace(/\/$/, "");

      const url =
        `${baseUrl}/api/v1/courses` +
        `?enrollment_state=active` +
        `&include[]=total_scores` +
        `&include[]=current_grading_period_scores`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${account.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          `Canvas grades failed for ${account.name}:`,
          response.status,
          errorText
        );

        continue;
      }

      const courses = await response.json();

      for (const course of courses) {
        /*
         * Canvas puts the current student's enrollment
         * inside course.enrollments when total_scores is requested.
         */

        const studentEnrollment =
          course.enrollments?.find(
            (enrollment: any) =>
              enrollment.type === "StudentEnrollment"
          );

        if (!studentEnrollment) {
          continue;
        }

        const score =
          studentEnrollment.computed_current_score ??
          studentEnrollment.current_score ??
          null;

        const letter =
          studentEnrollment.computed_current_grade ??
          studentEnrollment.current_grade ??
          "N/A";

        const points =
          studentEnrollment.computed_current_points ??
          studentEnrollment.current_points ??
          null;

        grades.push({
          course: course.name || "Unknown Course",

          courseId: course.id,

          score:
            score !== null
              ? Number(score)
              : null,

          points:
            points !== null
              ? Number(points)
              : null,

          letter,

          account:
            account.name || "Canvas",
        });
      }
    }

    return NextResponse.json({
      grades,
    });
  } catch (error: any) {
    console.error("Canvas grades error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Grade sync failed",
      },
      { status: 500 }
    );
  }
}
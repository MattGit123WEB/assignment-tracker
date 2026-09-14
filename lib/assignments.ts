export type Assignment = {
  id: number;
  title: string;
  className: string;
  description: string;
  dueDate: string;
  difficulty: number;
  estimatedTime: number;
  category: "Homework/Quiz" | "Test/Project";
  completed: boolean;
  pointsPossible: number;
  pointsEarned: number;
};


export const assignments: Assignment[] = [
  {
 id:1,
 title:"Biology Quiz Review",
 className:"Biology",
 description:"Review chapters 4-6 and complete study guide.",
 dueDate:"Friday",
 difficulty:8,
 estimatedTime:45,
 category:"Test/Project",
 completed:false,
 pointsPossible:100,
 pointsEarned:0
},

  {
    id: 2,
    title: "English Essay",
    className: "English",
    description: "Write analysis essay draft.",
    dueDate: "Thursday",
    difficulty: 9,
    estimatedTime: 120,
    category: "Homework/Quiz",
    completed: false,
    pointsPossible:100,
 pointsEarned:0
  },

  {
    id: 3,
    title: "Math Worksheet",
    className: "Math",
    description: "Complete problems 1-30.",
    dueDate: "Tomorrow",
    difficulty: 4,
    estimatedTime: 30,
    category: "Homework/Quiz",
    completed: true,
    pointsPossible:100,
 pointsEarned:0
  },
];
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function AddAssignment() {

  const router = useRouter();


  const [title,setTitle] = useState("");
  const [className,setClassName] = useState("");
  const [description,setDescription] = useState("");
  const [difficulty,setDifficulty] = useState(5);
  const [time,setTime] = useState(30);
  const [category,setCategory] = useState<
    "Homework/Quiz" | "Test/Project"
  >("Homework/Quiz");
  const [points,setPoints] = useState(100);



  function submit(){


    const existing =
      JSON.parse(
        localStorage.getItem("assignments") || "[]"
      );


    const newAssignment = {

      id: Date.now(),

      title,

      className,

      description,

      dueDate:"No date",

      difficulty,

      estimatedTime:time,

      category,

      completed:false,

      pointsPossible:points,

      pointsEarned:0

    };


    localStorage.setItem(
      "assignments",
      JSON.stringify([
        ...existing,
        newAssignment
      ])
    );


    // Return to assignments page
    router.push("/assignments");


  }



  return (

    <div className="
    min-h-screen
    flex
    items-center
    justify-center
    bg-gray-50
    p-6
    ">


      <div className="
      w-full
      max-w-xl
      rounded-3xl
      bg-white
      border
      shadow-lg
      p-8
      ">


        <h1 className="
        text-3xl
        font-bold
        text-gray-900
        text-center
        ">
          Add Assignment
        </h1>


        <p className="
        text-gray-500
        text-center
        mt-2
        ">
          Add something you need to complete.
        </p>



        <div className="mt-8 space-y-4">


          <input
          className="w-full rounded-xl border p-3"
          placeholder="Assignment Name"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          />


          <input
          className="w-full rounded-xl border p-3"
          placeholder="Class"
          value={className}
          onChange={(e)=>setClassName(e.target.value)}
          />


          <textarea
          className="w-full rounded-xl border p-3"
          placeholder="Description"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          />


          <select
          className="w-full rounded-xl border p-3"
          value={category}
          onChange={(e)=>
            setCategory(
              e.target.value as
              "Homework/Quiz" |
              "Test/Project"
            )
          }
          >

            <option value="Homework/Quiz">
              Homework / Quiz (60%)
            </option>

            <option value="Test/Project">
              Test / Project (40%)
            </option>

          </select>



          <input
          type="number"
          className="w-full rounded-xl border p-3"
          placeholder="Points Possible"
          value={points}
          onChange={(e)=>setPoints(Number(e.target.value))}
          />



          <input
          type="number"
          className="w-full rounded-xl border p-3"
          placeholder="Difficulty 1-10"
          value={difficulty}
          onChange={(e)=>setDifficulty(Number(e.target.value))}
          />



          <input
          type="number"
          className="w-full rounded-xl border p-3"
          placeholder="Estimated Minutes"
          value={time}
          onChange={(e)=>setTime(Number(e.target.value))}
          />



          <button
          onClick={submit}
          className="
          w-full
          rounded-xl
          bg-black
          text-white
          py-3
          font-semibold
          hover:opacity-80
          "
          >

            Create Assignment

          </button>



        </div>


      </div>


    </div>

  );

}
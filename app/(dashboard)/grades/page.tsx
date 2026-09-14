"use client";

import { useEffect, useState } from "react";


type Grade = {
  course:string;
  courseId:number;
  score:number;
  points:number;
  letter:string;
};



export default function GradesPage(){


const [grades,setGrades] =
useState<Grade[]>([]);


const [loading,setLoading] =
useState(false);




async function syncGrades(){


setLoading(true);



const accounts =
JSON.parse(
localStorage.getItem("canvasAccounts") || "[]"
);




const response =
await fetch(
"/api/canvas-grades",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
accounts
})

}

);



const data =
await response.json();



console.log(
"GRADE DATA:",
data
);



if(data.grades){

setGrades(
data.grades
);

}



setLoading(false);


}






useEffect(()=>{

syncGrades();

},[]);







return (

<div className="
min-h-screen
bg-gray-50
p-10
">


<div className="
flex
justify-between
items-center
">


<div>

<h1 className="
text-3xl
font-bold
">

Grades

</h1>


<p className="
text-gray-500
">

Canvas Grade Tracker

</p>


</div>




<button

onClick={syncGrades}

className="
bg-black
text-white
rounded-xl
px-5
py-3
"

>

Sync Grades

</button>



</div>







{

loading &&

<p className="
mt-8
">

Loading grades...

</p>

}






<div className="
mt-8
grid
gap-5
">


{

grades.map(
(grade)=>(


<div

key={grade.courseId}

className="
bg-white
border
rounded-2xl
p-6
"

>


<h2 className="
font-bold
text-xl
">

{grade.course}

</h2>



<div className="
mt-5
flex
justify-between
">


<div>

<p className="
text-4xl
font-bold
">

{grade.score?.toFixed(1) || 0}%

</p>


<p>

{grade.letter}

</p>


</div>




<div>

<p>
Points
</p>


<p className="
font-bold
">

{grade.points}

</p>


</div>



</div>



</div>


)

)


}



</div>





</div>

);


}
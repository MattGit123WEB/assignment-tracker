import {SchoolClass} from "./classes";


export function calculateCurrentGrade(
schoolClass:SchoolClass
){

const homework =
(schoolClass.homeworkEarned /
schoolClass.homeworkTotal) * 100;


const tests =
(schoolClass.testEarned /
schoolClass.testTotal) * 100;


return Number(
(
(homework * .60) +
(tests * .40)
).toFixed(1)
);

}



export function calculateZeroImpact(
schoolClass:SchoolClass,
category:"Homework/Quiz"|"Test/Project",
points:number
){


let homeworkEarned =
schoolClass.homeworkEarned;

let homeworkTotal =
schoolClass.homeworkTotal;


let testEarned =
schoolClass.testEarned;

let testTotal =
schoolClass.testTotal;



if(category==="Homework/Quiz"){

homeworkTotal += points;

}


if(category==="Test/Project"){

testTotal += points;

}



const homework =
(homeworkEarned /
homeworkTotal)*100;


const tests =
(testEarned /
testTotal)*100;



return Number(
(
(homework*.60)+
(tests*.40)
).toFixed(1)
);


}
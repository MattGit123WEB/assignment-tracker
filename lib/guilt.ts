export function generateGuiltMessage(
current:number,
afterZero:number
){

const difference =
(current-afterZero).toFixed(1);


if(Number(difference)<=0){
return "This assignment will not significantly affect your grade.";
}


if(Number(difference)>=5){
return `Skipping this assignment could cost you ${difference}% of your grade.`;
}


return `Skipping this assignment lowers your grade by ${difference}%.`;

}
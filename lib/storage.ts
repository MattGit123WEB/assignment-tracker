import { Assignment } from "./assignments";


const KEY = "assignments";


export function saveAssignments(
  assignments: Assignment[]
){
  localStorage.setItem(
    KEY,
    JSON.stringify(assignments)
  );
}


export function loadAssignments(): Assignment[]{

  const data =
    localStorage.getItem(KEY);


  if(!data){
    return [];
  }


  return JSON.parse(data);

}
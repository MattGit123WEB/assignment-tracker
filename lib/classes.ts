export type SchoolClass = {
  id:number;
  name:string;

  homeworkEarned:number;
  homeworkTotal:number;

  testEarned:number;
  testTotal:number;

  homeworkWeight:number;
  testWeight:number;
};


export const classes:SchoolClass[]=[

{
 id:1,
 name:"Biology",

 homeworkEarned:450,
 homeworkTotal:500,

 testEarned:95,
 testTotal:100,

 homeworkWeight:60,
 testWeight:40,
},


{
 id:2,
 name:"English",

 homeworkEarned:380,
 homeworkTotal:400,

 testEarned:90,
 testTotal:100,

 homeworkWeight:60,
 testWeight:40,
},


{
 id:3,
 name:"Math",

 homeworkEarned:490,
 homeworkTotal:500,

 testEarned:95,
 testTotal:100,

 homeworkWeight:60,
 testWeight:40,
}

];
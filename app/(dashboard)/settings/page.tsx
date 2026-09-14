"use client";

import { useEffect, useState } from "react";


type CanvasAccount = {
  id:number;
  name:string;
  url:string;
  token:string;
};


export default function SettingsPage(){

  const [accounts,setAccounts] = useState<CanvasAccount[]>([]);


  useEffect(()=>{

    const saved =
      localStorage.getItem("canvasAccounts");

    if(saved){
      setAccounts(JSON.parse(saved));
    }

  },[]);



  function addAccount(){

    setAccounts([
      ...accounts,
      {
        id:Date.now(),
        name:"",
        url:"",
        token:""
      }
    ]);

  }



  function updateAccount(
    id:number,
    field:keyof CanvasAccount,
    value:string
  ){

    setAccounts(
      accounts.map(account=>
        account.id===id
        ?
        {
          ...account,
          [field]:value
        }
        :
        account
      )
    );

  }



  function removeAccount(id:number){

    setAccounts(
      accounts.filter(
        account=>account.id!==id
      )
    );

  }



  function saveSettings(){

    localStorage.setItem(
      "canvasAccounts",
      JSON.stringify(accounts)
    );

    alert("Saved!");

  }





  async function syncCanvas(){

    const response =
      await fetch(
        "/api/canvas-sync",
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



    if(data.error){

      alert(data.error);
      return;

    }



    const old =
      JSON.parse(
        localStorage.getItem("assignments") || "[]"
      );



    const existing =
      new Set(
        old.map(
          (a:any)=>a.canvasId
        )
      );



    const newAssignments =
      data.assignments.filter(
        (a:any)=>
          !existing.has(a.canvasId)
      );



    localStorage.setItem(
      "assignments",
      JSON.stringify(
        [
          ...old,
          ...newAssignments
        ]
      )
    );


    alert(
      `Imported ${newAssignments.length} new assignments`
    );

  }





  function deleteDuplicates(){

    const assignments =
      JSON.parse(
        localStorage.getItem("assignments") || "[]"
      );


    const seen = new Set();


    const cleaned =
      assignments.filter(
        (a:any)=>{

          const key =
            a.canvasId ||
            a.title + a.className;


          if(seen.has(key)){
            return false;
          }


          seen.add(key);
          return true;

        }
      );



    localStorage.setItem(
      "assignments",
      JSON.stringify(cleaned)
    );


    alert(
      `Removed ${assignments.length-cleaned.length} duplicates`
    );

  }





  return (

    <div className="min-h-screen bg-gray-50 p-10">

      <div className="max-w-4xl mx-auto bg-white rounded-3xl border p-8">


        <h1 className="text-3xl font-bold">
          Settings
        </h1>


        <p className="text-gray-500 mt-2">
          Manage Canvas accounts.
        </p>



        <div className="mt-8 space-y-5">


          {
            accounts.map(account=>(

              <div
                key={account.id}
                className="border rounded-2xl p-5"
              >


                <div className="flex justify-between">

                  <h2 className="font-bold">
                    Canvas Account (GAVS)
                  </h2>


                  <button
                    onClick={()=>
                      removeAccount(account.id)
                    }
                    className="text-red-500"
                  >
                    Remove
                  </button>


                </div>



                <input
                  className="mt-4 w-full border rounded-xl p-3"
                  placeholder="Account Name"
                  value={account.name}
                  onChange={(e)=>
                    updateAccount(
                      account.id,
                      "name",
                      e.target.value
                    )
                  }
                />



                <input
                  className="mt-3 w-full border rounded-xl p-3"
                  placeholder="Canvas URL"
                  value={account.url}
                  onChange={(e)=>
                    updateAccount(
                      account.id,
                      "url",
                      e.target.value
                    )
                  }
                />



                <input
                  className="mt-3 w-full border rounded-xl p-3"
                  placeholder="Canvas Token"
                  type="password"
                  value={account.token}
                  onChange={(e)=>
                    updateAccount(
                      account.id,
                      "token",
                      e.target.value
                    )
                  }
                />


              </div>

            ))
          }



          <button
            onClick={addAccount}
            className="w-full border-2 border-dashed rounded-xl p-4"
          >
            + Add Canvas Account
          </button>



        </div>





        <div className="flex flex-wrap gap-4 mt-8">


          <button
            onClick={saveSettings}
            className="bg-black text-white rounded-xl px-5 py-3"
          >
            Save Settings
          </button>



          <button
            onClick={syncCanvas}
            className="border rounded-xl px-5 py-3"
          >
            Sync Canvas
          </button>



          <button
            onClick={deleteDuplicates}
            className="border border-red-400 text-red-600 rounded-xl px-5 py-3"
          >
            Delete Duplicate Assignments
          </button>

          <button

onClick={()=>{

const confirmReset =
confirm(
"Delete all assignments? You can sync Canvas again to restore them."
);


if(!confirmReset)
return;



localStorage.removeItem(
"assignments"
);



alert(
"All assignments removed. Sync Canvas to import them again."
);



window.location.reload();


}}

className="
border
border-red-600
text-red-600
rounded-xl
px-5
py-3
"

>

Reset All Assignments

</button>


        </div>


      </div>


    </div>

  );

}
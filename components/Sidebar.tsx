import Link from "next/link";

import {
  Home,
  BookOpen,
  Calendar,
  BarChart3,
  ClipboardList,
  Settings,
  Plus,
} from "lucide-react";


const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },

  {
    name: "Assignments",
    href: "/assignments",
    icon: ClipboardList,
  },

  {
    name: "Add Assignment",
    href: "/add-assignment",
    icon: Plus,
  },

  {
    name: "Planner",
    href: "/planner",
    icon: BookOpen,
  },

  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },

  {
    name: "Grades",
    href: "/grades",
    icon: BarChart3,
  },

  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];



export default function Sidebar() {

return (

<aside className="
w-64
min-h-screen
bg-white
border-r
p-6
">


<h1 className="text-xl font-bold text-gray-900">
Assignment Tracker
</h1>



<nav className="mt-8 space-y-2">


{navigation.map((item)=>{


const Icon=item.icon;


return (

<Link
key={item.name}
href={item.href}
className="
flex
items-center
gap-3
rounded-xl
p-3
text-gray-700
hover:bg-gray-100
"
>


<Icon size={20}/>

{item.name}


</Link>


);


})}


</nav>


</aside>

);

}
"use client";

import { Collapsible } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { type LucideIcon } from "lucide-react";
import Link from "next/link";

export function NavMain({
  items,
  pathname,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  pathname: string;
}) {
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          /** ACTIVE CHECK */
          if (process.env.NEXT_PUBLIC_ENV === "dev") {
            console.log("numba", item);
          }
          const isActive = pathname === item.url;

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem
                className={`
                  py-1 px-1 font-bricolage
                  ${isActive ? "bg-primaryGreen/10" : ""}
                `}
              >
                <Link href={item.url} onClick={handleLinkClick}>
                  <SidebarMenuButton
                    className={`
                      py-1 hover:bg-gray-200
                      ${
                        isActive
                          ? "bg-primaryGreen text-white hover:bg-primaryGreen"
                          : ""
                      }
                    `}
                    tooltip={item.title}
                  >
                    {item.icon && (
                      <item.icon
                        className={
                          isActive ? "text-white" : "text-absoluteDark"
                        }
                      />
                    )}
                    <span
                      className={`
                        text-base pl-2
                        ${isActive ? "text-white" : "text-absoluteDark"}
                      `}
                    >
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </Link>

                {/* HANDLE SUBMENU */}
                {item.items && item.items.length > 0 && (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const subActive =
                        pathname === subItem.url ||
                        pathname.startsWith(subItem.url + "/");

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={
                              subActive ? "bg-primaryGreen text-white" : ""
                            }
                          >
                            <Link href={subItem.url} onClick={handleLinkClick}>
                              <span>{subItem.title}</span>
                              {/* {subItem.url == "/help-center" ? (
                                <a target="_blank">
                                  <span>{subItem.title}</span>
                                </a>
                              ) : (
                                <span>{subItem.title}</span>
                              )} */}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

// "use client";

// import { Collapsible } from "@/components/ui/collapsible";
// import {
//   SidebarGroup,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarMenuSub,
//   SidebarMenuSubButton,
//   SidebarMenuSubItem,
//   useSidebar,
// } from "@/components/ui/sidebar";
// import { type LucideIcon } from "lucide-react";
// import Link from "next/link";

// export function NavMain({
//   items,
// }: {
//   items: {
//     title: string;
//     url: string;
//     icon?: LucideIcon;
//     isActive?: boolean;
//     items?: {
//       title: string;
//       url: string;
//     }[];
//   }[];
// }) {
//   const { setOpenMobile } = useSidebar();

//   const handleLinkClick = () => {
//     setOpenMobile(false);
//   };

//   return (
//     <SidebarGroup>
//       <SidebarMenu>
//         {items.map((item) => (
//           <Collapsible
//             key={item.title}
//             asChild
//             defaultOpen={item.isActive}
//             className="group/collapsible"
//           >
//             <SidebarMenuItem className="py-1 px-1 font-bricolage">
//               <Link className="" href={item.url} onClick={handleLinkClick}>
//                 <SidebarMenuButton
//                   className="py-1  hover:bg-gray-200"
//                   tooltip={item.title}
//                 >
//                   {item.icon && <item.icon className=" " />}
//                   <span className="text-base pl-2  text-absoluteDark">
//                     {item.title}
//                   </span>
//                 </SidebarMenuButton>
//               </Link>
//               {item.items && item.items.length > 0 && (
//                 <SidebarMenuSub>
//                   {item.items.map((subItem) => (
//                     <SidebarMenuSubItem key={subItem.title}>
//                       <SidebarMenuSubButton asChild>
//                         <Link href={subItem.url} onClick={handleLinkClick}>
//                           <span className="text-black">{subItem.title}</span>
//                         </Link>
//                       </SidebarMenuSubButton>
//                     </SidebarMenuSubItem>
//                   ))}
//                 </SidebarMenuSub>
//               )}
//             </SidebarMenuItem>
//           </Collapsible>
//         ))}
//       </SidebarMenu>
//     </SidebarGroup>
//   );
// }

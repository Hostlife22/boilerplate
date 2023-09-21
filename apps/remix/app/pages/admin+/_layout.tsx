import { join } from "@boilerplate/shared"
import { NavLink, Outlet } from "@remix-run/react"
import { json, redirect, type LoaderArgs } from "@vercel/remix"
import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request)
  if (user.global_role_id !== "1") return redirect("/")
  return json(null)
}

export default function AdminLayout() {
  return (
    <div className="flex">
      <div className="p-8">
        <ul>
          <li>
            <NavLink end to="/admin" className={({ isActive }) => join("", isActive && "text-primary-500")}>
              Admin
            </NavLink>
          </li>
          <li>
            <NavLink to="users" className={({ isActive }) => join("", isActive && "text-primary-500")}>
              Users
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="w-full p-8">
        <Outlet />
      </div>
    </div>
  )
}

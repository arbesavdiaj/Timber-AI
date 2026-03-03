import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Plus, Shield, UserPlus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import UserManagementTable from "@/components/users/UserManagementTable";
import { hasPermission } from "@/components/utils/permissions";

export default function UserManagement() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then((user) => setCurrentUser(user));
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  // Check permissions
  if (currentUser && !hasPermission(currentUser, "viewUsers")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-500">
              You don't have permission to view user management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: Users,
      color: "from-[#40916C] to-[#52B788]",
    },
    {
      label: "Administrators",
      value: users.filter(
        (u) => u.user_role === "administrator" || u.role === "admin",
      ).length,
      icon: Shield,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Foresters",
      value: users.filter((u) => u.user_role === "forester").length,
      icon: UserPlus,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Analysts",
      value: users.filter((u) => u.user_role === "analyst").length,
      icon: Download,
      color: "from-blue-500 to-blue-600",
    },
  ];

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#0F2E1D]">
              User Management
            </h1>
            <p className="text-gray-500">
              Manage team members and access control
            </p>
          </div>
          {hasPermission(currentUser, "manageUsers") && (
            <Button className="bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl gap-2">
              <Plus className="w-5 h-5" />
              Invite User
            </Button>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#0F2E1D]">
                          {stat.value}
                        </p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <UserManagementTable
            onEditUser={(user) => console.log("Edit user:", user)}
          />
        </motion.div>
      </div>
    </div>
  );
}

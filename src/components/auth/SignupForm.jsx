import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TreePine,
  Mail,
  User,
  Building,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    user_role: "analyst",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In Base44, users are invited, but we'll simulate the signup process
      // and redirect to login where the actual invitation would happen
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-2 border-gray-100 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#40916C] to-[#52B788] flex items-center justify-center mx-auto mb-4">
            <TreePine className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-gray-500 text-sm">
            Join the forest intelligence platform
          </p>
        </CardHeader>

        <CardContent>
          {!success ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="pl-10 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="user_role">Role</Label>
                <Select
                  value={formData.user_role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, user_role: value })
                  }
                >
                  <SelectTrigger className="mt-1 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analyst">
                      Analyst - View data & reports
                    </SelectItem>
                    <SelectItem value="forester">
                      Forester - Manage zones & operations
                    </SelectItem>
                    <SelectItem value="administrator">
                      Administrator - Full access
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department (Optional)</Label>
                <div className="relative mt-1">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="department"
                    placeholder="Forest Operations"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#40916C] hover:bg-[#2D6A4F] rounded-xl h-11"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Account Created!
              </h3>
              <p className="text-gray-500">Redirecting to login...</p>
            </div>
          )}

          {!success && (
            <div className="mt-6 text-center">
              <button
                onClick={onSwitchToLogin}
                className="text-sm text-[#40916C] hover:text-[#2D6A4F] font-medium"
              >
                Already have an account? Sign in
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

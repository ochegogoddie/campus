import { hash } from "bcryptjs";
import { prisma } from "./lib/prisma";

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: "password" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists!");
      console.log("   Username: password");
      console.log("   Role: ADMIN");
      await prisma.$disconnect();
      return;
    }

    // Hash the password
    const hashedPassword = await hash("username1", 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: "password",
        email: "admin@taskhive.local",
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("   Username: password");
    console.log("   Password: username1");
    console.log("   Role: ADMIN");
    console.log("   Email: admin@taskhive.local");
    console.log("");
    console.log("🔐 Login at: https://campustaskhive.onrender.com/login");
    
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

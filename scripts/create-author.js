const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://dbadmin:Aa123456@dmd-dev.ftfhd1o.mongodb.net/?retryWrites=true&w=majority&appName=dmd-dev";

const UserSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["client", "employee", "admin", "administrator", "author"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  pin: {
    type: String,
    required: function () {
      return ["employee", "admin", "administrator", "author"].includes(
        this.role
      );
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function createAuthor() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const existingAuthor = await User.findOne({ phone: "+77711770303" });
    if (existingAuthor) {
      console.log("Author user already exists");
      return;
    }

    const hashedPin = await bcrypt.hash("2788", 12);

    const author = new User({
      role: "author",
      name: "Lord",
      phone: "+77711770303",
      pin: hashedPin,
    });

    await author.save();
    console.log("Author user created successfully");
    console.log("Name: Lord");
    console.log("Phone: +77711770303");
    console.log("PIN: 2788");
  } catch (error) {
    console.error("Error creating author user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

createAuthor();

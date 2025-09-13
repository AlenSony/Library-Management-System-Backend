import cors from "cors";
import express from "express";
import mongoose from "mongoose";

const app = express();

const port = process.env.PORT || 3000;

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://localhost:27017/LibraryManagementSystem";

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

app.use(cors());

app.use(express.json());

const ReaderSchema = new mongoose.Schema(
  {
    readerID: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    book: [
      {
        type: String,
        ref: "Book",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Reader = mongoose.model("Reader", ReaderSchema);

const authorSchema = new mongoose.Schema({
  authorID: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

const Author = mongoose.model("Author", authorSchema);

const BookSchema = new mongoose.Schema(
  {
    bookID: {
      type: String,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    author: {
      type: String,
      ref: "Author",
      required: true,
    },
    publisher: {
      type: String,
      ref: "Publisher",
      required: true,
    },
    edition: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", BookSchema);

const StaffSchema = new mongoose.Schema({
  staffID: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});



const Staff = mongoose.model("Staff", StaffSchema);

const PublisherSchema = new mongoose.Schema({
  publisherID: {
    type: String,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  yearOfPublication: {
    type: Number,
  },
});

const Publisher = mongoose.model("Publisher", PublisherSchema);

app.post("/api/author", async(req,res) => {
  try{
    if(!body){
      return res.status(401).json({message: "Request body is missing.."})
    }
    const {authorID, name, email}=body;
    if(! authorID || ! name || !email){
      return res.status(401).json({message: "Please fill in all fields to commence.."});
    }
    const existingAuthor = await Author.findOne({email});

    if(existingAuthor){
      return res.status(400).json({message: "Author with email already exists"});
    }
    const newAuthor = await Author.create({
      authorID,
      name,
      email,
    });
    return res.status(201).json({message: "Author created successfully", author: newAuthor});

  }
  catch(err){
    console.log("Failed to register user")
  }
});

app.get("/api/author", async(req,res) => {
  try{
    if(!body){
      return res.status(401).json({message: "Request body is missing.."})
    }
    const {authorID, name, email}= req.body;
    if(! authorID || ! name || !email){
      return res.status(401).json({message: "Please fill in all fields to commence.."});
    }
    
    const details = await Author.findOne({email});
    if(details){
      return res.status(201).json({
        message: "Author details fetched successfully", Author: details});
    }
    else{
      return res.status(401).json({
        message: "Author doesn't exist"
      });
    }
  }
  catch(err){
    console.log("Failed to find user")
  }
});





app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

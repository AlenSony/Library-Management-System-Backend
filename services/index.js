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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
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
    availability: {
      type: Boolean,
      required: true,
    },
    stock: {
      type: Number,
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

const Book_Issue_Schema = new mongoose.Schema({
  reader_name: {
    type: String,
    required: true,
  },
  book_name: {
    type: String,
    required: true,
  },
  readerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reader",
  },
  bookID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
  status:{
    type: String,
    required: true,
  },
  issueDate: {
    type: date,
    default: Date.now,
  },
  returnDate: {
    type: date,
    required: true,
  },
});

const Book_Issue = mongoose.model("Book_Issue", Book_Issue_Schema);

app.post("/api/bookissue", async(req, res) => {
  try{
    const {reader_name, book_name, readerID, bookID, status, issueDate, returnDate} = req.body;

    const book = await Book.findOne({title: book_name});
    const book_id = book.bookID;
    
    const reader = await Reader.findOne({name: reader_name});
    const reader_id = reader.readerID;

    const newBookIssue = await Book_Issue.create({
      reader_name,
      book_name,
      readerID: reader_id,
      bookID: book_id,
      status,
      issueDate: Date.now,
      returnDate,
    });
    return res.status(201).json({message: "Book issued successfully", bookIssue: newBookIssue});
  }
  catch(err){
    res.status(500).json({message: "Failed to issue book"});
  }
});

app.patch("/api/bookissue", async(req,res) => {
  try{
    const {reader_name, book_name, readerID, bookID, status, issueDate, returnDate} = req.body;
    const bookIssue = await Book_Issue.findOneAndUpdate({reader_name, book_name}, {status: "returned", returnDate: Date.now() }, {new: true});
    return res.status(200).json({message: "Book issue updated successfully", bookIssue});
  }
  catch(err){
    res.status(500).json({message: "Failed to update book issue"});
  }
});

app.post("/api/author", async(req,res) => {
  try{
    if(! req.body){
      return res.status(401).json({message: "Request body is missing.."})
    }
    const {authorID, name, email}= req.body;
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
    console.log("Failed to register Author")
  }
});

app.get("/api/author", async(req,res) => {
  try{
    if(! req.body){
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
    console.log("Failed to find Author details");
  }
});


app.post("/api/publisher", async(req,res) => {
  try{
    if(! req.body){
      return res.status(401).json({message: "Request body is missing.."})
    }
    const {publisherID, name, yearOfPublication}= req.body;
    if(! publisherID || ! name || ! yearOfPublication){
      return res.status(401).json({message: "Please fill in all fields to commence.."});
    }
    const existingPublisher= await Publisher.findOne({name});

    if(existingPublisher){
      return res.status(400).json({message: "Publisher already exists"});
    }
    const newPublisher = await Publisher.create({
      publisherID,
      name,
      yearOfPublication,
    });
    return res.status(201).json({message: "Publisher  added successfully", pubisher: newPublisher});

  }
  catch(err){
    console.log("Failed to register publisher")
  }
});

app.get("/api/publisher", async(req,res) => {
  try{
    if(! req.body){
      return res.status(401).json({message: "Request body is missing.."})
    }
    const {publisherID, name, yearOfPublication}= req.body;
    if(! publisherID || ! name || ! yearOfPublication){
      return res.status(401).json({message: "Please fill in all fields to commence.."});
    }
    
    const details = await Publisher.findOne({name});
    if(details){
      return res.status(201).json({
        message: "Publisher details fetched successfully", Publisher: details});
    }
    else{
      return res.status(401).json({
        message: "Publisher doesn't exist"
      });
    }
  }
  catch(err){
    console.log("Failed to find Publisher details");
  }
});

app.post("/api/staff", async(req, res) => {
  try{
    if(! req.body){
      return res.status(401).json({message: "Request body is missing.."})
    }
    const {staffID, name}= req.body;
    if(! staffID || ! name){
      return res.status(401).json({message: "Please fill in all fields to commence.."});
    }
    const existingStaff = await Staff.findOne({staffID});

    if(existingStaff){
      return res.status(400).json({message: "Staff already exists"});
    }
    const newStaff = await Staff.create({
      staffID,
      name,
    });
    return res.status(201).json({message: "Staff added successfully", staff: newStaff});
  }
  catch(err){
    res.status(500).json({message: "Failed to register staff"});
  }
});
app.get("/api/staff", async(req, res) => {
  try{
    if(! req.body){
      return res.status(401).json({message: "Request body is missing.."})
    }
    const {staffID, name}= req.body;
    if(! staffID || ! name){
      return res.status(401).json({message: "Please fill in all fields to commence.."});
    }
    const details = await Staff.findOne({staffID});
    if(details){
      return res.status(201).json({
        message: "Staff details fetched successfully", Staff: details});
    }
    else{
      return res.status(401).json({
        message: "Staff doesn't exist"
      });
    }
  }
  catch(err){
    res.status(500).json({message: "Failed to find staff details"});
  }
});

app.post("/api/book", async(req, res) => {
  try{
    if(! req.body){
      return res.status(401).json({message: "Request body is missing.."})
    }
    const {bookID, title, author, publisher, edition, price, availability, stock}= req.body;
    if(! bookID || ! title || ! author || ! publisher || ! edition || ! price || ! availability || ! stock){
      return res.status(401).json({message: "Please fill in all fields to commence.."});
    }
    const existingBook = await Book.findOne({title});

    if(existingBook){
      return res.status(400).json({message: "Book already exists"});
    }
    const newBook = await Book.create({
      bookID,
      title,
      author,
      publisher,
      edition,
      price,
      availability,
      stock,
    });
    return res.status(201).json({message: "Book added successfully", book: newBook});
  }
  catch(err){
    res.status(500).json({message: "Failed to register book"});
  }
  });

  app.get("/api/book", async(req, res) => {
    try{
      if(! req.body){
        return res.status(401).json({message: "Request body is missing.."})
      }
      const {bookID, title, author, publisher, edition, price, availability, stock}= req.body;
      if(! bookID || ! title || ! author || ! publisher || ! edition || ! price || ! availability || ! stock){
        return res.status(401).json({message: "Please fill in all fields to commence.."});
      }
      const details = await Book.findOne({title});
      if(!availability){
        return res.status(401).json({message: "Book is not available"});
      }
      if(details){
        return res.status(201).json({
          message: "Book details fetched successfully", Book: details});
      }
      else{
        return res.status(401).json({
          message: "Book doesn't exist"
        });
      }
    }
    catch(err){
      res.status(500).json({message: "Failed to find book details"});
    }
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const port = 3000;
const app = express();

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true })); //middleware för att parsea form data

app.use(express.static("public")); //middleware för att servera statiska filer

const client = new MongoClient("mongodb://127.0.0.1:27017"); //skapa client som kopplar upp sig mot mongodb
await client.connect();
const db = client.db("lotrmc"); //sparar referens till databasen "lotrmc"
const membersCollection = db.collection("members"); //sparar referens till collectionen "members"

// skapa route för home sidan
app.get("/", (req, res) => {
  res.render("home", { activePage: "home" });
});

app.get("/members", async (req, res) => {
  let members;
  members = await membersCollection.find({}).toArray();
  if (members.length === 0) {
    console.log("no members found");
  }
  // console.log(members);
  res.render("members", {
    activePage: "members",
    title: "Our Members",
    members,
  });
});

app.get("/create", (req, res) => {
  res.render("create", { activePage: "create" });
});

app.post("/create", async (req, res) => {
  console.log(req.body);
  // res.send(req.body);
  await membersCollection.insertOne(req.body);
  res.redirect("/members");
});

app.get("/member/:id", async (req, res) => {
  // använder en try-catch block för felhantering
  try {
    // hitta member meed id från databasen med await
    const member = await membersCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    if (member) {
      // Rendera member detail sidan om member existerar
      res.render("member", {
        title: "Member Details",
        activePage: "",
        member,
      });
    } else {
      // generera error om member existerar inte
      throw new Error("Member not found");
    }
  } catch (error) {
    // Catch error och hanterar den
    console.error(error);
    // Sätter status code till 404
    res.status(404);
    // Rendera 404 sidan med data
    res.render("404", { url: req.url, activePage: "" });
  }
});

app.get("/member/:id/delete", async (req, res) => {
  // console.log(membersCollection);
  await membersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect("/members");
});
// för att hantera obefintliga eller ogiltiga routes
app.use((req, res) => {
  res.status(404).render("404", {
    activePage: "",
  });
});

//lyssna på port 3000
app.listen(port, () => console.log(`Listening on port ${port}`));

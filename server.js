//Importanto express
const express = require('express')

//Importar otras librerias
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion, ObjectId  } = require('mongodb');
const cors = require('cors')
const { initializeApp }  = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require( "firebase/auth" ) ;

const firebaseConfig = {
  apiKey: "AIzaSyD219BOrRH6e-zN3FxqZw8KVP7xTL1NNJg",
  authDomain: "claseuxq4.firebaseapp.com",
  projectId: "claseuxq4",
  storageBucket: "claseuxq4.appspot.com",
  messagingSenderId: "900803087543",
  appId: "1:900803087543:web:d3c5cbc3720c2baabed132"
};

const uri = "mongodb+srv://moli:admin1@clusterproyectoux.qshylyi.mongodb.net/?retryWrites=true&w=majority";
//Init express 
const app = express()



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server    (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir); 

//definir el parse
var urlEncodeParser = bodyParser.urlencoded({extended:true});


//Definir el puerto
let port = 3001;


// utilizar / set el parser
const firebaseApp = initializeApp(firebaseConfig);
app.use(urlEncodeParser);
app.use(cors())

//Levantar el servidor 
app.listen(port, ()=>{
    console.log('SERVIDOR CONEXTANDOSE CORRECTAMENTE EN EL PUERTO', port);
})
console.log('Esta linea esta despues del .listen');

//Callback
//Endpoint
app.get('/listPost',async (req,res)=>{
  try {
    const client = new MongoClient(uri);
 
    const database = client.db("examenII");
    const usuarios = database.collection("Post");
    // Execute query 
    //const cursor = usuarios.find(query, options);
    const cursor = usuarios.find({});
    // // Print a message if no documents were found
    // if ((await usuarios.countDocuments(query)) === 0) {
    //   console.log("No documents found!");
    //   res.status(200).send("No se encontraron registros");
    // }
    // Print returned documents
    let arr = []
    for await (const doc of cursor) {
      console.dir(doc);
      arr.push(doc)
    }
    res.status(200).send({
      documentos: arr,
    });
  }catch (error){
    res.status(500).send("No se pudo ejecutar la query....");
  } finally {
    await client.close();
  }

} )



app.post('/createPost', async(req,res)=>{
    console.log('Recibi una peticion- post');
    try{
        const client = new MongoClient(uri);
        //Conectar con la base de datos, examenII, si la base de datos existe nos conectamos
        const database = client.db("examenII");
        const post = database.collection("Post");

        //Documento a insertar
        const doc = req.body;

        const result = await post.insertOne(doc);
        //Print the ID if the inserted docuemnt
        console.log(`El rsultado fue:   ${result}`);
        console.log(`A document was inserted with the _id:   ${result.insertedId}`);
        res.status(200).send("El Post se creo exitosamente")
    }catch(error){
        res.status(200).send("No se creo el post, algo salio mal")
    } finally{
        //Close the MongoDB client connection
        await client.close();
    }
    
})

app.get('/getFile', (req,res)=>{
  console.log('Recibi una peticion - REGRESAR HTML');
  console.log('El parametro que venia en la ruta  es ',  req.params.id);
  console.log('El parametro que venia en el body es ',  req.body.mensaje);
  console.log('El parametro que venia en el body es ',  req.body.correo);
  console.log('El parametro que venia en el body es ',  req.body.id);
  res.status(200).sendFile(path.join(__dirname+"/info.html"));
    
})

app.delete('/deletePost/:id', async(req,res)=>{
  try {
    const client = new MongoClient(uri);
    //Conectar con la base de datos, examenII, si la base de datos existe nos conectamos
    const database = client.db("examenII");
    const post = database.collection("Post");
    const idFromReq = req.params.id;
    const query = { _id: new ObjectId(idFromReq)};
    const result = await post.deleteOne(query);
    console.log('Deletion result:', result);

    if (result.deletedCount === 1) {

      console.log("Successfully deleted one document.");
      
      res.status(200).send("Se borro algo exitosamente");
      
    } else {
      console.log("No documents matched the query. Deleted 0 documents.");
      res.status(200).send("Ningun documento hizo match con la busqueda, no se elimino nada");
    }
  }catch(error){
    res.status(500).send("Algo salio mal, no pudimos borrar el documento");
  } finally {
    // Close the connection after the operation completes
    await client.close();
  }
  
} )


app.put('/editPost/:id',async (req,res)=>{
  try {
    const client = new MongoClient(uri);
    const database = client.db("examenII");
    const usuarios = database.collection("Post");
    // Crear el filtro para la informacion
    const idFromReq = req.params.id;
    const filter = { _id: new ObjectId(idFromReq) };

    /* Upsert en true significa que si el documento no existe lo crea*/
    const options = { upsert: false };

    // Data con la que actualizaremos el documento.
    const updateDoc = {
      $set: {
        ...req.body,
      },
    };
    // Actualizar el primer documento que haga match con el filtro 
    const result = await usuarios.updateOne(filter, updateDoc, options);
    
    // Print the number of matching and modified documents
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
    );
    res.status(200).send("Se actualizo la informacion correctamente");
  }catch (error){
    res.status(500).send("No se pudo actualizar la información")
  } finally {
    // Close the connection after the operation completes
    await client.close();
  }
   
} )

//post usando firebase
app.post("/createUserWithEmailAndPassword",  (_req, res) => {
  const auth = getAuth(firebaseApp);
  const email = _req.body.email;
  const password = _req.body.password;
createUserWithEmailAndPassword(auth, email, password)
  .then((resp) => {
    res.status(200).send({
      msg: "Esta es la respuesta de firebase", 
      data: resp,
    })
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    res.status(500).send({
      msg: "Error al crear el usuario", 
      errorCode: errorCode,
      errorMsg: errorMessage
    })
  
  });

})


app.post("/logIn",   (req, res) =>{
  try {
    const auth = getAuth(firebaseApp);
    const email = req.body.email;
    const password = req.body.password;
    signInWithEmailAndPassword(auth, email, password)
    .then((resp) => {
      //Signed In
      res.status(200).send({
        msg: "Log In exitoso :)",
        data: resp
      })
      // ...
    })
    .catch ((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res.status(500).send({
        msg: "Error al hacer log in",
        errorCode: errorCode,
        errorMessage: errorMessage
      })
    });
    
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    res.status(500).send({
      msg: "Error al hacer log in",
      errorCode: errorCode,
      errorMessage: errorMessage
    })
    
  }
})

app.post("/logOut",  (req,res) => {
    const auth = getAuth(firebaseApp);
    signOut(auth).then(() => {
      console.log('Se cerro bien la sesion');
      res.status(200).send('Sesión cerrada correctamente'); 
    }).catch((error) => {
      console.log('Hubo un error');
      res.status(500).send('Error al cerrar sesión');
    });
});

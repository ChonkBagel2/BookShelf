import express from 'express'; 
import { Client } from 'pg'; 
import 'dotenv/config'; 
import bodyParser from 'body-parser'; 
import getCover from './api.js';




const app = express(); 
const port = 3000; 


app.use( bodyParser.urlencoded( { extended: true } ) ); 
app.use( express.static('public') ); 




let books = [] 


const db = new Client({ 
    'user' : process.env.USER, 
    'password' : process.env.PASSWORD, 
    'database' : process.env.DATABASE, 
    'host' : process.env.HOST, 
    'port' : process.env.PORT, 
}); 


// db.connect(); 
// It is very important to have your username with the variable 'user' or something other than 'username' 
// in the .env file 
// Because the variable 'username' or process.env.USERNAME is taken by the admin of pc by default 
// which won't let you connect to  your database 


async function dbQuery() { 

    await db.connect(); 
    
    const connectionCheck = await db.query('SELECT NOW()'); 

    if ( connectionCheck.rows.length > 0 ) {
        console.log( 'Connection to database Established' ); 
    }
    else {
        console.log( 'Connection Failed' ); 
    }
}

dbQuery(); 


async function getBooks() { 

    try {

        const query = await db.query( 'SELECT * FROM books' ) 

        if ( query.rows.length > 0 ) { 

            return query.rows; 
        }
    }
    catch ( error ) {
        console.log( error ) 
    }
}


async function postRecord( title, author, rating, notes, coverLink ) {  

    const query = await db.query('INSERT INTO books ( title, author, rating, notes, cover_link ) VALUES ( $1, $2, $3, $4, $5 ) RETURNING *', [ title, author, rating, notes, coverLink ] ); 

    return query
} 




// Routes 
app.get('/', function ( req, response ) { 

    response.send( 'Server is working' ); 
}) 


app.get('/books', async function ( req, response ) { 


    books = await getBooks(); 

    response.render('home.ejs', { books: books } );  
})


app.get('/add', function ( req, response ) { 

    response.render('form.ejs', {
        update: false, 
        book: { 
            rating: 0, 
        }
    }); 
}) 


app.post('/add', async function ( req, response ) { 


    const title = req.body['title'] 
    const author = req.body['author'] 
    const rating = parseInt( req.body['rating'] ) 
    const notes = req.body['notes'] 
    const coverResponse = await getCover( title, author, 'L' ) 
    let coverLink = ''; 

    if ( coverResponse[ 0 ] === 200 ) {
        coverLink = coverResponse[ 1 ]; 
    }
    else { 
        coverLink = '/images/template_image_blue.jpg'; 
    }

    console.log( coverLink ); 

    const query = await postRecord( title, author, rating, notes, coverLink ); 

    if ( query.rowCount === 1 ) {

        response.redirect('/books'); 
    }
    else {
        console.log( 'There was some error re-directing user' ); 
    }

}) 


app.get('/book/:id', function ( req, response ) { 


    const bookId = parseInt( req.params.id ); 

    const foundBook = books.find( function ( book ) {
        return book.id === bookId; 
    })

    response.render( 'detail.ejs', { book: foundBook } ); 
})


app.post('/patch/:id', async function ( req, response ) { 

    const bookId = parseInt( req.params.id ); 

    // find the book and render the form page with pre-filled values 

    const book = books.find( function ( book ) {
        return book.id === bookId; 
    }) 

    response.render( 'form.ejs', { 
        update: true, 
        book: book 
    })
    // create a new route from there 
})


app.post('/update/:id', async function ( req, response ) { 


    const bookId = parseInt( req.params.id ); 

    // we will update the entry in the database with the values recieved 

    const title = req.body['title'] 
    const author = req.body['author'] 
    const rating = parseInt( req.body['rating'] ) 
    const notes = req.body['notes'] 

    const query = await db.query( 'UPDATE books SET title = $1, author = $2, rating = $3, notes = $4 WHERE id = $5', [ title, author, rating, notes, bookId ] ); 

    if ( query.rowCount === 1 ) { 
        
        response.redirect( '/books' ); 
    }


})


app.post('/delete/:id', async function ( req, response ) { 

    
    const bookId = parseInt( req.params.id ) 

    // delete the book from the db and redirect the user to the home page 

    try { 
        
        const query = await db.query('DELETE FROM books WHERE id = $1', [ bookId ] ); 

        if ( query.rowCount === 1 ) {
            
            response.redirect('/books'); 
        }
        else {
            console.log( 'There was some error deleting book ' ); 
        }

    }
    catch ( error ) {
        console.log( error ); 
    }
})




app.listen( port, function () { 
    console.log( 'Server is working' ); 
})



























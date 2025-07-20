import axios from 'axios'; 




// Write the code to fetch the cover from api 


async function getId( bookName, author ) { 

    try { 

        const bookArray = bookName.trim().split(' '); 
        const updatedBookName = bookArray.join('+');

        const authorArray = author.trim().split(' '); 
        const updatedAuthor = authorArray.join('+'); 

        const url = `https://openlibrary.org/search.json?title=${updatedBookName}&author=${updatedAuthor}&limit=1`; 

        const result = await axios.get( url )

        if ( result.status === 200 ) { 

            // console.log( result.data );  
            return result.data; 
        }
        else {
            console.log( 'Error code other than 200 returned ' ); 
        }
    }
    catch ( error ) {
        console.log( error ); 
    }
} 


async function getCover( bookName, author, size ) { 

    
    try { 
        
        const details = await getId( bookName, author ) 


        if ( details.docs.length === 1 ) {

            if ( details.docs[ 0 ].cover_i ) {

                const key = 'id'
                const value = details.docs[ 0 ].cover_i; 
                const url = `https://covers.openlibrary.org/b/${key}/${value}-${size}.jpg` 

                return [ 200, url ]; 
            }
            else {
                return [ 404, 'The book has no cover' ]; 
            }
        }
        else {
            return [ 501, 'Details not found for book' ]; 
        }
    }
    catch ( error ) { 

        console.log( error ); 
    }
} 


export default getCover; 




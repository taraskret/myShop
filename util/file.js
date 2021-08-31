const fs = require('fs')

const deleteFile = (fileP)=>{
    fs.unlink(fileP, (err)=>{
        if(err){
            throw (err);
        }
        
    })
};

exports.deleteFile = deleteFile;
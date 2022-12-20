export const fileFilter = ( req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if(!file) return callback(Error('File is empty'), false)
    
    const fileExtension = file.mimetype.split('/')[1];
    const validExtesion = ['jpg', 'jpeg', 'png','gif']
    
    if(validExtesion.includes(fileExtension)){
        return callback(null, true)
    }

    callback(null, false);

}
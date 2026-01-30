module.exports.adduser = function(path,object,obj) {


 sails.hooks.email.send(
    path, 
    object,
    obj,
 function(err) {console.log(err || "Mail Sent!");}
 )
}
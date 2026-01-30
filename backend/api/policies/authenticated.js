/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to require an authenticated user, or else redirect to login page
 *                 Looks for an Authorization header bearing a valid JWT token
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

module.exports = async function (req, res, next) {
    // sails.helpers.verifyJwt.with({
    //     req: req,
    //     res: res
    // })
    //     .switch({
    //         error: function (err) {
    //               var msg= {
    //                             status:'error',
    //                             status_code:500,

    //                            message:" internal serverError ",
    //                           };
    //                         res.json({record:msg});
    //             return //res.serverError(err)
    //         },
    //         invalid: function (err) {
                
    //             if (req.wantsJSON) {
                    
    //                  var msg= {
    //                             status:'error',
    //                             status_code:403,

    //                            message:"Session close please login   ",
    //                           };
    //                         res.json({record:msg});
    //                 return //res.sendStatus(404)

    //             }
                
    //             return res.redirect('/login')
    //         },
    //         success: function () {
               
    //             return next()
    //         }
    //     })

    return next()
}

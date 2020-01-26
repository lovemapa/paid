const socketController = require('../Socket/socketController')
const userController = require('../comapany/comapanyControllers/comapanyController')

const soc = new socketController();

module.exports = (io) => {
    var socketInfo = {};
    var rooms = [];
    var room_members = {}
    userController.cronJob(io)

    io.on('connection', function (socket) {
        console.log('Someone connected');

        socket.on('disconnect', function () {       //Disconnecting the socket
            delete socketInfo[socket.username];
            // console.log(socketInfo);

        });


        soc.sendLiveLocation(socket, io, socketInfo)  // Drivers nearby Send Their Live location
        soc.addUsername(socket, io, socketInfo) //Add username to corresponding socketID
        soc.sendRequest(socket, io, socketInfo) // Send Request to Owner
        soc.acceptRequest(socket, io, socketInfo) // Response From Owner
        soc.completeBooking(socket, io, socketInfo) // Complete booking request 
        soc.cancelBooking(socket, io, socketInfo) // Cancel booking request 
        soc.sendMessage(socket, io, socketInfo) //Send Message
        soc.chatHistory(socket, io, socketInfo)   //get Chat History

    })

}





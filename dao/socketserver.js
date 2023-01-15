module.exports = (io) => {

    let socketList = {}

    io.on('connection', (socket) => {
        console.log(`${socket.id}连接 socket.io 成功！`)

        socket.on('', () => {

        })
    })
}
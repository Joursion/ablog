var fs = require('fs');
fs.open('./message.text','r',function(err,fd)
{
    var buf = new Buffer(255);
    fs.read(fd,buf,0,9,3,function(err,byteRead,buffer)
	{
		console.log(buffer.slice(0,bytesRead).tostring());

	});
})


var


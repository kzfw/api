import nodemailer from 'nodemailer';
import neh from 'nodemailer-express-handlebars';
import path from 'path';

const __dirname = path.resolve();

const transport = nodemailer.createTransport({
	host: "monday.mxrouting.net",
	port: 465,
	secure: true,
	requireTLS: true,
	auth: {
		user: 'no-reply@zfwartcc.net',
		pass: process.env.EMAIL_PASSWORD
	},
});

transport.use('compile', neh({
	viewPath: __dirname+"/email",
	viewEngine: {
		extName: ".hbs",
		layoutsDir: __dirname+"/email",
		partialsDir: __dirname+"/email",
		defaultLayout: "main"
	},
	extName: ".hbs"
}));

export default transport;



// organizational email list
// atm@zfwartcc.net
// datm@zfwartcc.net
// ta@zfwartcc.net
// ec@zfwartcc.net
// wm@zfwartcc.net
// fe@zfwartcc.net
// management@zfwartcc.net
// training@zfwartcc.net
// events@zfwartcc.net
// webteam@zfwartcc.net
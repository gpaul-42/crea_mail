const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const fs = require('fs')
var passwordValidator = require('password-validator');
const randomstring = require("randomstring");
var randomWords = require('random-words');
const accent = require('remove-accents')
const rn = require('random-number');
const publicIp = require('public-ip');

puppeteer.use(StealthPlugin())
var schema = new passwordValidator();
schema.has().uppercase().lowercase().digits()

gene(Number(process.argv[2]), process.argv[3])

async function gene(nbr, option) {

	var my_ip = await publicIp.v4()
	var i = 0
	var IMAP = 1
	if (option == "-no")
		IMAP = 0
	while (nbr > i) {

		var password = randomstring.generate({ length: 10 });
		while (schema.validate(password) == false) {
			password = randomstring.generate({ length: 10 });
		}
		var mail = accent(randomWords()) + randomstring.generate({ length: 5, charset: 'numeric' }) + "@hotmail.com"
		console.log(mail, password)
		if (i % 3 == 0 && i > 0) {
			while (my_ip == await publicIp.v4()) {
				console.log("ROTATE")
				await sleep(1000)
			}
			my_ip = await publicIp.v4()
		}
		await create_outlook(mail, password, IMAP)
		obj = JSON.parse(fs.readFileSync('../mail.json'))
		obj.push(mail + ":" + password)
		fs.writeFileSync('../mail.json', JSON.stringify(obj, null, '\t'))
		i++;
	}
	return
}

async function create_outlook(mail, password, IMAP) {
	const browser = await puppeteer.launch({
		headless: false,
		timeout: 0,
		ignoreHTTPSErrors: true,
	});
	const page = await browser.newPage();
	await page.setViewport({ width: 800, height: 600 })
	await page.goto('https://signup.live.com/signup');
	await page.type('#MemberName', mail)
	await page.tap('#iSignupAction')
	await page.waitForTimeout(1500)
	await page.type('#PasswordInput', password)
	await page.tap('#iSignupAction')
	await page.waitForTimeout(500)
	await page.type('#FirstName', randomstring.generate({ length: 10 }))
	await page.type('#LastName', randomstring.generate({ length: 10 }))
	await page.tap('#iSignupAction')
	await page.waitForTimeout(500)
	await page.select('#Country', "FR");
	await page.select('#BirthDay', String(gen_day()));
	await page.select('#BirthMonth', String(gen_month()));
	await page.waitForTimeout(100)
	await page.type('#BirthYear', String(gen_year()));
	await page.tap('#iSignupAction')
	await page.waitForNavigation()
	if (IMAP == 1) {
		await page.tap('#idBtn_Back')
		await page.waitForNavigation()
		await page.goto('https://outlook.com');
		await page.waitForNavigation()
	}
	await browser.close()
	return 0

}
const gen_day = rn.generator({
	min: 1,
	max: 28,
	integer: true
})
const gen_month = rn.generator({
	min: 1,
	max: 12,
	integer: true
})
const gen_year = rn.generator({
	min: 1979,
	max: 2005,
	integer: true
})
function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
import express from 'express';
const router = express.Router();
import PilotOnline from '../models/PilotOnline.js';
import AtcOnline from '../models/AtcOnline.js';
import ControllerHours from '../models/ControllerHours.js';

const airports = {
	DFW: 'DFW', 
    DAL: 'Love', 
	OKC: 'Oke City',
    LBB: 'Lubbock', 
    ACT: 'Waco',
	ABI: 'Abilene',
	ADM: 'Ardmore',
	ADS: 'Addison',
	AFW: 'Alliance',
	BAD: 'Barksdale',
	CNW: 'TSTC',
	CSM: 'Sherman',
	DTN: 'Downtown',
	DTO: 'Denton',
	DYS: 'Dyess',
	FSI: 'Fort Sill',
	FTW: 'Meacham',
	FWS: 'Spinks',
	GGG: 'Eastex',
	GKY: 'Arlington',
	GPM: 'Grand Prarie',
	GRK: 'Gray',
	GVT: 'Majors',
	GYI: 'North Texas',
	HLR: 'Hood',
	HQZ: 'Mesquite',
	HOB: 'Hobbs',
	LAW: 'Lawton',
	LTS: 'Altus',
	MAF: 'Midland',
	MLU: 'Monroe',
	NFW: 'Navy Fort Worth',
	OUN: 'Westheimer',
	PWA: 'Wiley Post',
	RBD: 'Executive',
	SHV: 'Shreveport',
	SJT: 'San Angelo',
	SPS: 'Sheppard',
	TIK: 'Tinker',
	TKI: 'Mc Kinney',
	TXK: 'Texarkana',
	TYR: 'Pounds',
	FTW: 'Fort Worth',
	REG: 'Regional'
};

const positions = {
	DEL: 'Delivery',
	GND: 'Ground',
	TWR: 'Tower',
	DEP: 'Departure',
	APP: 'Approach',
	CTR: 'Center',
	/*OKC_GND: 'Roger Ground',
	OKC_DEL: 'Rogers Delivery',
	OKC_TWR: 'Rogers Tower',
	OKC_APP: 'Oke City Approach',
	OKC_DEP: 'Oke City Departure'*/
};

router.get('/', async ({res}) => {
	try {
		const pilots = await PilotOnline.find().lean();
		const atc = await AtcOnline.find().lean({virtuals: true});

		res.stdRes.data = {
			pilots: pilots,
			atc: atc
		}
	} catch(e) {
		req.app.Sentry.captureException(e);
		res.stdRes.ret_det = e;
	}

	return res.json(res.stdRes);
});

router.get('/top', async (req, res) => {
	try {
		const d = new Date();
		const thisMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
		const nextMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 1))
		const sessions = await ControllerHours.find({$or: [{$and: [{ position: { $not: /.*_(I|M)_.*/ } },{ timeStart: { $gt: thisMonth, $lt: nextMonth } }]},{$and: [{$or: [{ position: "ORD_I_GND" },{ position: "ORD_M_GND" }]},{ timeStart: { $gt: thisMonth, $lt: nextMonth } }]}]}).populate("user", "fname lname cid");
		const controllerTimes = {};
		const positionTimes = {};
		for(const session of sessions) {
			const posSimple = session.position.replace(/_[A-Z0-9]{1,3}_/, '_');
			const len = Math.round((session.timeEnd.getTime() - session.timeStart.getTime()) / 1000);
			if(!controllerTimes[session.cid]) {
				controllerTimes[session.cid] = {
					name: session.user ? `${session.user.fname} ${session.user.lname}` : session.cid,
					cid: session.cid,
					len: 0
				};
			}
			if(!positionTimes[posSimple]) {
				const posParts = posSimple.split('_');
				positionTimes[posSimple] = {
					name: `${airports[posParts[0]] ? airports[posParts[0]] : 'Unknown'} ${positions[posParts[1]] ? positions[posParts[1]] : 'Unknown'}`,
					len: 0
				}
			}
			controllerTimes[session.cid].len += len;
			positionTimes[posSimple].len += len;
		}
		res.stdRes.data.controllers = Object.values(controllerTimes).sort((a, b) => b.len - a.len).slice(0,5);
		res.stdRes.data.positions = Object.values(positionTimes).sort((a, b) => b.len - a.len).slice(0,5);
	} catch(e) {
		req.app.Sentry.captureException(e);
		res.stdRes.ret_det = e;
	}

	return res.json(res.stdRes);
})

export default router;

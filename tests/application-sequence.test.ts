import {expect,it} from 'vitest';
import {CARD_GLIDE,CARD_HOLD,CARD_RETURN,applicationCycleDuration,applicationFrame,diagramBeat,mesLotX,twinCoated,twinPartPose} from '../components/home/application-sequence';

it('walks the four cards forward slowly and returns in one fast pass',()=>{
 const forward=4*CARD_HOLD+3*CARD_GLIDE;
 expect(applicationFrame(0)).toMatchObject({progress:0,direction:'forward'});
 expect(applicationFrame(CARD_HOLD-.05).progress).toBe(0);
 expect(applicationFrame(CARD_HOLD+CARD_GLIDE/2).progress).toBeCloseTo(.5);
 expect(applicationFrame(forward-.05)).toMatchObject({progress:3,direction:'forward'});
 const returning=applicationFrame(forward+CARD_RETURN/2);
 expect(returning.direction).toBe('return');
 expect(returning.progress).toBeCloseTo(1.5);
 expect(CARD_RETURN).toBeLessThan(CARD_GLIDE);
 expect(applicationFrame(applicationCycleDuration()).progress).toBeCloseTo(0);
 expect(applicationFrame(applicationCycleDuration()).direction).toBe('forward');
});

it('plays four diagram beats and blackens the part after the coat tank',()=>{
 expect(diagramBeat(0).step).toBe(0);
 expect(diagramBeat(CARD_HOLD*.5).step).toBe(2);
 expect(diagramBeat(CARD_HOLD)).toMatchObject({step:3,travel:1});
 expect(mesLotX(0)).toBeLessThan(mesLotX(1));
 expect(mesLotX(2)).toBeLessThan(mesLotX(3));
 const coat=twinPartPose(1,.5);
 expect(coat.y).toBeGreaterThan(20);
 expect(coat.rope).toBeGreaterThan(58);
 expect(twinPartPose(1,.65).rope).toBeGreaterThan(120);
 expect(coat.x).toBeGreaterThan(twinPartPose(0,.5).x);
 expect(twinPartPose(3,.5).y).toBe(0);
 expect(twinPartPose(0,0).y).toBe(0);
 expect(twinCoated(0,.9)).toBe(false);
 expect(twinCoated(1,.2)).toBe(false);
 expect(twinCoated(1,.7)).toBe(true);
 expect(twinCoated(3,.5)).toBe(true);
});

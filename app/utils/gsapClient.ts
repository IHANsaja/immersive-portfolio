// app/utils/gsapClient.ts
'use client';

import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';
import SplitText from 'gsap-trial/SplitText';
import {ScrollSmoother} from "gsap/dist/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText, ScrollSmoother);

export { ScrollTrigger, ScrambleTextPlugin, SplitText };
export default gsap;

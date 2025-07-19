// app/utils/gsapClient.ts
'use client';

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';
import SplitText from 'gsap-trial/SplitText'; // 👈 MUST come from gsap-trial

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText);

export { ScrollTrigger, ScrambleTextPlugin, SplitText };
export default gsap;

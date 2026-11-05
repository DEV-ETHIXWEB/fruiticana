/* The full Motion feature set (animations, gestures, layout). Loaded lazily by MotionProvider,
   after the page has painted, so it never delays first paint on a slow phone. */
import { domMax } from "motion/react";

export default domMax;

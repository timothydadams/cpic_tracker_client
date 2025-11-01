import { createContext, useContext, useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './tooltip';
import { Popover, PopoverTrigger, PopoverContent } from './popover';

const TouchContext = createContext(undefined);

const useTouch = () => useContext(TouchContext);

const TouchProvider = (props) => {
  const [isTouch, setTouch] = useState();

  useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  return <TouchContext.Provider value={isTouch} {...props} />;
};

const HybridTooltipProvider = (props) => {
  return <TooltipProvider delayDuration={0} {...props} />;
};

const HybridTooltip = (props) => {
  const isTouch = useTouch();

  return isTouch ? <Popover {...props} /> : <Tooltip {...props} />;
};

const HybridTooltipTrigger = (props) => {
  const isTouch = useTouch();

  return isTouch ? (
    <PopoverTrigger {...props} />
  ) : (
    <TooltipTrigger {...props} />
  );
};

const HybridTooltipContent = (props) => {
  const isTouch = useTouch();

  return isTouch ? (
    <PopoverContent {...props} />
  ) : (
    <TooltipContent {...props} />
  );
};

export {
  TouchProvider,
  HybridTooltipProvider,
  HybridTooltip,
  HybridTooltipTrigger,
  HybridTooltipContent,
};

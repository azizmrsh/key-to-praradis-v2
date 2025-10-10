import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface TimeValue {
  hours: number;
  minutes: number;
}

interface TimePickerProps {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
  label?: string;
}

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [hours, setHours] = useState<number>(value.hours);
  const [minutes, setMinutes] = useState<number>(value.minutes);

  const handleHoursChange = (hoursValue: string) => {
    const newHours = parseInt(hoursValue, 10);
    setHours(newHours);
    onChange({
      hours: newHours,
      minutes,
    });
  };

  const handleMinutesChange = (minutesValue: string) => {
    const newMinutes = parseInt(minutesValue, 10);
    setMinutes(newMinutes);
    onChange({
      hours,
      minutes: newMinutes,
    });
  };

  return (
    <div className="flex flex-col space-y-1.5">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2 items-center">
        <Select
          value={hours.toString()}
          onValueChange={handleHoursChange}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
              <SelectItem key={hour} value={hour.toString()}>
                {hour.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xl">:</span>
        <Select
          value={minutes.toString()}
          onValueChange={handleMinutesChange}
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Minute" />
          </SelectTrigger>
          <SelectContent>
            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((minute) => (
              <SelectItem key={minute} value={minute.toString()}>
                {minute.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_AVAILABLE_SLOTS } from "@/apollo/user/query";
import { AppointmentTime } from "@/libs/enums/appointment.enum";

interface CalendarContentProps {
  doctorId?: string;
  onSelectionChange?: (date: string, time: string) => void;
}

interface SlotItem {
  time: AppointmentTime | string;
  free: boolean;
}

const CalendarContent: React.FC<CalendarContentProps> = ({
  doctorId,
  onSelectionChange,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [days, setDays] = useState<React.ReactElement[]>([]);
  const [monthYear, setMonthYear] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const { data: slotsData, loading: slotsLoading, refetch: refetchSlots } = useQuery(
    GET_AVAILABLE_SLOTS,
    {
      variables: {
        input: {
          doctorId: doctorId || "",
          date: selectedDate,
        },
      },
      skip: !doctorId || !selectedDate,
      fetchPolicy: "network-only",
    }
  );

  const availableSlots = useMemo(() => {
    const slots = (slotsData?.getAvailableSlots?.list ?? []) as SlotItem[];
    return slots.filter((slot) => slot.free);
  }, [slotsData]);

  const formatDateString = (year: number, month: number, day: number) => {
    const monthValue = String(month + 1).padStart(2, "0");
    const dayValue = String(day).padStart(2, "0");
    return `${year}-${monthValue}-${dayValue}`;
  };

  const getTimeLabel = (timeValue: string) => {
    if (Object.values(AppointmentTime).includes(timeValue as AppointmentTime)) {
      return timeValue;
    }
    if (Object.keys(AppointmentTime).includes(timeValue)) {
      return AppointmentTime[timeValue as keyof typeof AppointmentTime];
    }
    return timeValue;
  };

  const timeTitle = useMemo(() => {
    if (!selectedDate) {
      return "Select A Date";
    }

    const [year, month, day] = selectedDate.split("-").map((value) => Number(value));
    const displayDate = new Date(year, month - 1, day);
    return `Available Times - ${displayDate.toLocaleDateString("default", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}`;
  }, [selectedDate]);

  const isWeekend = useMemo(() => {
    if (!selectedDate) {
      return false;
    }
    const [year, month, day] = selectedDate.split("-").map((value) => Number(value));
    const displayDate = new Date(year, month - 1, day);
    const dayOfWeek = displayDate.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }, [selectedDate]);

  const handleSlotClick = useCallback((timeValue: string) => {
    setSelectedSlot(timeValue);
  }, []);

  const handleDayClick = useCallback(
    (day: number) => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      setSelectedDate(formatDateString(year, month, day));
      setSelectedSlot("");
    },
    [currentDate]
  );

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedDate, selectedSlot);
    }
  }, [onSelectionChange, selectedDate, selectedSlot]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  const renderCalendar = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();

    setMonthYear(
      currentDate.toLocaleDateString("default", {
        month: "long",
        year: "numeric",
      })
    );

    const daysArray: React.ReactElement[] = [];

    for (let i = firstDay; i > 0; i--) {
      daysArray.push(
        <div key={`prev-${i}`} className="prev-date">
          {prevLastDate - i + 1}
        </div>
      );
    }

    for (let i = 1; i <= lastDate; i++) {
      const isToday =
        i === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();

      daysArray.push(
        <div
          key={`current-${i}`}
          className={isToday ? "active" : ""}
          onClick={() => handleDayClick(i)}
        >
          {i}
        </div>
      );
    }

    const totalDays = firstDay + lastDate;
    const nextDays = 7 - (totalDays % 7 === 0 ? 7 : totalDays % 7);
    for (let i = 1; i <= nextDays; i++) {
      daysArray.push(
        <div key={`next-${i}`} className="next-date">
          {i}
        </div>
      );
    }

    setDays(daysArray);

    // Auto-select today's date (once per render of the grid)
    const todayElement = daysArray.find(
      (day) =>
        (day as React.ReactElement<HTMLDivElement>).props.className === "active"
    );
    if (todayElement) {
      const children = (todayElement as React.ReactElement<HTMLDivElement>)
        .props.children;
      const dayNumber = parseInt(String(children), 10) || 0;
      if (dayNumber) handleDayClick(dayNumber);
    }
  }, [currentDate, handleDayClick]);

  // ✅ Only depend on currentDate to avoid re-running due to callback identity churn
  useEffect(() => {
    renderCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  return (
    <>
      <div className="calendar-container">
        <div className="month">
          <button id="prev-wrap" onClick={goToPrevMonth}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="22"
              viewBox="0 0 12 22"
              fill="none"
            >
              <path
                d="M0 11C0 11.2557 0.0977488 11.5117 0.292998 11.707L10.2929 21.7069C10.6837 22.0977 11.3164 22.0977 11.7069 21.7069C12.0974 21.3162 12.0977 20.6834 11.7069 20.2929L2.41399 11L11.7069 1.70697C12.0977 1.31622 12.0977 0.683468 11.7069 0.292969C11.3162 -0.0975304 10.6834 -0.0977802 10.2929 0.292969L0.292998 10.293C0.0977488 10.4882 0 10.7442 0 11Z"
                fill="#5A6A85"
              />
            </svg>
          </button>
          <span id="month-year">{monthYear}</span>
          <button id="next-wrap" onClick={goToNextMonth}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="22"
              viewBox="0 0 12 22"
              fill="none"
            >
              <path
                d="M12 11C12 11.2557 11.9023 11.5117 11.707 11.707L1.70705 21.7069C1.31631 22.0977 0.683559 22.0977 0.293061 21.7069C-0.097437 21.3162 -0.097687 20.6834 0.293061 20.2929L9.58601 11L0.293061 1.70697C-0.097687 1.31622 -0.097687 0.683468 0.293061 0.292969C0.683809 -0.0975304 1.31656 -0.0977802 1.70705 0.292969L11.707 10.293C11.9023 10.4882 12 10.7442 12 11Z"
                fill="#5A6A85"
              />
            </svg>
          </button>
        </div>

        <div className="weekdays">
          <div>SU</div>
          <div>MO</div>
          <div>TU</div>
          <div>WE</div>
          <div>TH</div>
          <div>FR</div>
          <div>SA</div>
        </div>

        <div className="days" id="days">
          {days}
        </div>

        <div className="time-slots">
          <div className="time-title-row">
            <h4 id="time-title">{timeTitle}</h4>
            <button
              type="button"
              onClick={() => refetchSlots()}
              disabled={!doctorId || !selectedDate || slotsLoading}
              className="time-refresh-btn"
            >
              Refresh
            </button>
          </div>
          <div className="slots" id="slots">
            {!isMounted && <div className="slot" />}
            {isMounted && !doctorId && (
              <div className="slot">Select a doctor</div>
            )}
            {isMounted && doctorId && !selectedDate && (
              <div className="slot">Select a date</div>
            )}
            {isMounted && doctorId && selectedDate && isWeekend && (
              <p color="gray">Weekends are non-working days</p>
            )}
            {isMounted && doctorId && selectedDate && !isWeekend && slotsLoading && (
              <div className="slot">Loading slots...</div>
            )}
            {isMounted &&
              doctorId &&
              selectedDate &&
              !isWeekend &&
              !slotsLoading &&
              availableSlots.length === 0 && (
                <div className="slot">No available slots</div>
              )}
            {isMounted &&
              doctorId &&
              selectedDate &&
              !isWeekend &&
              !slotsLoading &&
              availableSlots.map((slot) => {
                const label = getTimeLabel(String(slot.time));
                const isActive = selectedSlot === String(slot.time);
                return (
                  <div
                    key={`${selectedDate}-${slot.time}`}
                    className={isActive ? "slot active" : "slot"}
                    onClick={() => handleSlotClick(String(slot.time))}
                  >
                    {label}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarContent;

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaChevronRight, FaChevronLeft, FaRegCalendarAlt } from 'react-icons/fa';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface PredefinedRange {
  id: number | null;
  label: string;
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  onDateRangeChange: (dateRange: [string, string] | null, weekends: string[]) => void;
  predefinedRanges?: PredefinedRange[];
}

const DateRangePicker: React.FC<DateRangePickerProps> =  ({ onDateRangeChange, predefinedRanges = [] }) => {
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [weekends, setWeekends] = useState<string[]>([]);

  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const [activePdRange, setActivePdRange] = useState<number | null>(null);

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  const formatDate = (date: Date): string => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  };

  const getWeekendDates = (start: Date, end: Date): string[] => {
    const weekends: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      if (!isWeekday(current)) {
        weekends.push(formatDate(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return weekends;
  };

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const formattedRange: [string, string] = [
        formatDate(dateRange.startDate),
        formatDate(dateRange.endDate)
      ];
      console.log(dateRange.startDate, dateRange.endDate);
      const weekendDates = getWeekendDates(dateRange.startDate, dateRange.endDate);
      setWeekends(weekendDates);
      onDateRangeChange(formattedRange, weekendDates);
    } else {
      onDateRangeChange(null, []);
      setWeekends([]);
    }
  }, [dateRange, onDateRangeChange]);

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    if(!isWeekday(clickedDate)) return;

    let newDateRange: DateRange;

    if (!dateRange.startDate || (dateRange.startDate && dateRange.endDate)) {
      newDateRange = { startDate: clickedDate, endDate: null };
    } else {
      if (clickedDate < dateRange.startDate) {
        newDateRange = { startDate: clickedDate, endDate: dateRange.startDate };
      } else {
        newDateRange = { startDate: dateRange.startDate, endDate: clickedDate };
      }
    }
    // console.log(newDateRange);
    setDateRange(newDateRange);
  };

  const isDateInRange = (date: Date) => {
    if (!dateRange.startDate) return false;
    if (!dateRange.endDate) return date.getTime() === dateRange.startDate.getTime();
    return date >= dateRange.startDate && date <= dateRange.endDate;
  };

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isWeekendDay = !isWeekday(date);
      days.push(
        <DateButton
          key={day}
          onClick={() => handleDateClick(day)}
          className={`p-2 m-1 text-center ${
            isDateInRange(date) ? 'in-range' : ''
          } ${isWeekendDay ? 'weekend' : ''}
          ${(dateRange.startDate && date.getTime() === dateRange.startDate.getTime()) || (dateRange.endDate && date.getTime() === dateRange.endDate.getTime())
            ? 'endpoint' : ''
          } `}
          disabled={isWeekendDay}
        >
          {day}
        </DateButton>
      );
    }
    return days;
  };

  const changeMonth = (increment: number) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentYear(parseInt(event.target.value));
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push(
        <option key={year} value={year}>
          {year}
        </option>
      );
    }
    return years;
  };

  const handlePredefinedRangeClick = (range: PredefinedRange) => {
    setDateRange({
      startDate: range.startDate,
      endDate: range.endDate
    });
    setActivePdRange(range.id);
  };

  return (
    <DateRangeComponent>
      <h3 className="text-center d-flex align-items-center justify-content-center gap-3">
        <FaRegCalendarAlt color="#FF5634" /> 
        <b>DateRange Picker</b>
      </h3>
      <DateRangeWrapper>
          <div className="d-flex justify-content-between align-items-center p-2">
            <ControlButton onClick={() => changeMonth(-1)}>
              <FaChevronLeft />
            </ControlButton>
            <SelectWrapper>
              <select value={currentMonth} onChange={handleMonthChange}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
                <select value={currentYear} onChange={handleYearChange}>
                  {generateYearOptions()}
                </select>
            </SelectWrapper>
            {/* <span className="month-year">{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span> */}
            <ControlButton onClick={() => changeMonth(1)}>
              <FaChevronRight />
            </ControlButton>
          </div>
          <div className="calendar-map p-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="day-item text-center">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
      </DateRangeWrapper>
      <PredefinedRangesComponent>
        <h3>Predefined Ranges</h3>
        <PredefinedRangesWrapper>
          {predefinedRanges.map((range, index) => (
            <PredefinedRangeButton
              key={index}
              onClick={() => handlePredefinedRangeClick(range)}
              className={`${ activePdRange === range.id ? 'active': '' }`}
            >
              {range.label}
            </PredefinedRangeButton>
          ))}
        </PredefinedRangesWrapper>
      </PredefinedRangesComponent>
      <ResultsPopover>
        <h4>Selected Date Range</h4>
        {dateRange.startDate && dateRange.endDate ? (
          <>
            <p>
              [<span>{formatDate(dateRange.startDate)}</span> - <span>{formatDate(dateRange.endDate)}</span>]
            </p>
            <h5>Weekends:</h5>
            <ul>
              {weekends.map((date, index) => (
                <li key={index}>{date}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>No date range selected</p>
        )}
      </ResultsPopover>
    </DateRangeComponent>
  )
}

const DateRangeComponent = styled.div`
  padding: 4rem;

  h3{
    color: #FF5634;
    opacity: 0.6;
  }
`;

const DateRangeWrapper = styled.div`
  margin: 2rem auto;
  padding: 1rem;
  max-width: 500px;
  width: 100%;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  border-radius: 16px;
  background-color: #ffffff;
  transition: all 0.6s ease-in-out;

  .month-year{
    font-size: 24px;
    font-weight: 600;
  }

  .calendar-map{
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-gap: 0.25rem;

    .day-item{
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
  }
`;

const DateButton = styled.button`
  border: 0;
  background: #ffffff;
  font-size: 24px;
  color: rgba(0,0,0,1);
  border-radius: 8px;

  &:hover{
    background-color: #FF5634;
    color: #ffffff;
  }

  &.in-range{
    background-color: #FF5634;
    opacity: 0.4;
    color: #ffffff;

    &.endpoint{
      opacity: 1;
    }
  }

  &.weekend{
    color: rgba(0,0,0,0.3);
  }

  &:disabled{
    background: #ffffff;
    color: rgba(0,0,0,0.3);
    opacity: 1;
  }
`;

const ControlButton = styled.button`
  border: 0;
  background: #ffffff;
  font-size: 24px;
  color: rgba(0,0,0,0.6);
  opacity: 0.4;
  color: #000;

  &:hover{
    opacity: 1;
  }
`;

const SelectWrapper = styled.div`
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0 20px;
  background-color: rgba(0,0,0,0.1);
  padding: 8px 20px;
  border-radius: 24px;

  select{
    border:0;
    background-color: transparent;
    padding-right: 10px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    
    &:focus{
      border: 0;
      outline: none;
      box-shadow: none;
    }
  }
`;

const PredefinedRangesComponent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  position: fixed;
  left: 40px;
  top: 50%;
  transform: translate3d(0,-50%,0);

  @media only screen and (max-width: 992px){
    bottom: 80px;
    top: auto;
    left: 0%;
    transform: translate3d(0%, 0, 0);
    width: 100%;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  h3{
    display: block;
    font-weight: 700;
    margin-bottom: 1rem;
  }
`;

const PredefinedRangesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 15px;

  @media only screen and (max-width: 992px){
    flex-direction: row;
    justify-content: center;
  }
`;

const PredefinedRangeButton = styled.button`
  border: 0;
  padding: 10px 20px;
  background-color: #ffffff;
  border-radius: 32px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  transition: all 0.6s eas-in-out;

  &.active{
    background-color: #FF5634;
    color: #fff;
  }
`;

const ResultsPopover = styled.div`
  position: fixed;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #fff;
  padding: 2rem 1rem;
  border-radius: 24px;

  h4{
    font-size: 24px;
    font-weight: 800;
  }

  span{
    font-size: 16px;
    font-weight: 700;
  }

  ul{
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 340px;
    overflow: auto;

    &::-webkit-scrollbar{
      width: 4px;
    }

    &::-webkit-scrollbar-thumb{
      width: 4px;
      border-radius: 8px;
      background-color: rgba(0,0,0,0.2);
    }
  }
`;

export default DateRangePicker;
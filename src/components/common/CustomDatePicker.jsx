import React, { useState, useRef, useEffect } from "react";
import { IconCalendar, IconChevronLeft, IconChevronRight } from "../../Icons";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function padZero(num) {
  return num < 10 ? `0${num}` : `${num}`;
}

function formatDisplayDate(dateStr, type = "date") {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (type === "month" || parts.length === 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    if (isNaN(year) || isNaN(month)) return dateStr;
    return `${MONTH_NAMES[month]} ${year}`;
  }
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
    return `${day < 10 ? '0' + day : day} ${MONTH_NAMES[month]} ${year}`;
  }
  return dateStr;
}

function toIsoString(year, month, day) {
  return `${year}-${padZero(month + 1)}-${padZero(day)}`;
}

function toIsoMonthString(year, month) {
  return `${year}-${padZero(month + 1)}`;
}

export default function CustomDatePicker({
  value,
  onChange,
  type = "date", // "date" | "month"
  placeholder,
  className = "",
  disabled = false,
  required = false,
  min,
  max,
  id
}) {
  const isMonthOnly = type === "month";
  const defaultPlaceholder = isMonthOnly ? "Pilih Bulan & Tahun..." : "Pilih Tanggal...";
  const finalPlaceholder = placeholder || defaultPlaceholder;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial view date
  const getInitialView = () => {
    if (value) {
      const parts = value.split("-");
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          return { year: y, month: m };
        }
      }
    }
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  };

  const [viewState, setViewState] = useState(getInitialView);
  const [viewMode, setViewMode] = useState(isMonthOnly ? "months" : "calendar"); // "calendar" | "months" | "years"

  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          setViewState({ year: y, month: m });
        }
      }
    }
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      setViewMode(isMonthOnly ? "months" : "calendar");
    }
  }, [isOpen, isMonthOnly]);

  // Click outside & Escape key to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setViewMode(isMonthOnly ? "months" : "calendar");
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setViewMode(isMonthOnly ? "months" : "calendar");
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isMonthOnly]);

  // Navigation handlers
  const prevMonth = (e) => {
    e.stopPropagation();
    if (isMonthOnly || viewMode === "months") {
      setViewState(prev => ({ ...prev, year: prev.year - 1 }));
    } else {
      setViewState(prev => {
        if (prev.month === 0) {
          return { year: prev.year - 1, month: 11 };
        }
        return { year: prev.year, month: prev.month - 1 };
      });
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (isMonthOnly || viewMode === "months") {
      setViewState(prev => ({ ...prev, year: prev.year + 1 }));
    } else {
      setViewState(prev => {
        if (prev.month === 11) {
          return { year: prev.year + 1, month: 0 };
        }
        return { year: prev.year, month: prev.month + 1 };
      });
    }
  };

  const handleSelectDate = (year, month, day) => {
    const iso = toIsoString(year, month, day);
    onChange({ target: { value: iso } });
    setIsOpen(false);
    setViewMode("calendar");
  };

  const handleSelectMonthOnly = (monthIdx) => {
    const iso = toIsoMonthString(viewState.year, monthIdx);
    onChange({ target: { value: iso } });
    setViewState(prev => ({ ...prev, month: monthIdx }));
    setIsOpen(false);
  };

  const handlePreset = (presetType) => {
    const now = new Date();
    if (isMonthOnly) {
      let yr = now.getFullYear();
      let mo = now.getMonth();
      if (presetType === "prev") {
        mo = mo === 0 ? 11 : mo - 1;
        if (mo === 11) yr -= 1;
      } else if (presetType === "next") {
        mo = mo === 11 ? 0 : mo + 1;
        if (mo === 0) yr += 1;
      }
      const iso = toIsoMonthString(yr, mo);
      onChange({ target: { value: iso } });
      setViewState({ year: yr, month: mo });
      setIsOpen(false);
      return;
    }

    let target = new Date();
    if (presetType === "today") {
      target = now;
    } else if (presetType === "yesterday") {
      target.setDate(now.getDate() - 1);
    } else if (presetType === "tomorrow") {
      target.setDate(now.getDate() + 1);
    }
    const iso = toIsoString(target.getFullYear(), target.getMonth(), target.getDate());
    onChange({ target: { value: iso } });
    setViewState({ year: target.getFullYear(), month: target.getMonth() });
    setIsOpen(false);
    setViewMode("calendar");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { value: "" } });
  };

  // Generate days for calendar
  const getDaysGrid = () => {
    const { year, month } = viewState;
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: totalDaysInPrevMonth - i,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true
      });
    }

    // Next month days to fill grid (up to 35 or 42)
    const totalRendered = days.length;
    const remaining = totalRendered > 35 ? 42 - totalRendered : 35 - totalRendered;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false
      });
    }

    return days;
  };

  const today = new Date();
  const todayStr = toIsoString(today.getFullYear(), today.getMonth(), today.getDate());
  const currentMonthStr = toIsoMonthString(today.getFullYear(), today.getMonth());
  const selectedStr = value || "";

  return (
    <div
      ref={containerRef}
      className={`modern-datepicker-container ${className} ${isOpen ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`}
      id={id}
    >
      <div
        className={`modern-datepicker-trigger ${isOpen ? "active" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={finalPlaceholder}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) setIsOpen(!isOpen);
          }
        }}
      >
        <div className="modern-datepicker-icon-wrap">
          <IconCalendar size={17} />
        </div>
        <span className={`modern-datepicker-display ${!value ? "is-placeholder" : ""}`}>
          {value ? formatDisplayDate(value, type) : finalPlaceholder}
        </span>

        {value && !disabled && (
          <button
            type="button"
            className="modern-datepicker-clear"
            onClick={handleClear}
            title="Hapus Filter"
            aria-label="Hapus filter tanggal"
          >
            &times;
          </button>
        )}
      </div>

      {isOpen && (
        <div className="modern-datepicker-popover">
          {/* Preset Shortcuts */}
          <div className="modern-datepicker-presets">
            {isMonthOnly ? (
              <>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => handlePreset("prev")}
                >
                  Bulan Lalu
                </button>
                <button
                  type="button"
                  className="preset-btn active"
                  onClick={() => handlePreset("current")}
                >
                  Bulan Ini
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => handlePreset("next")}
                >
                  Bulan Depan
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => handlePreset("yesterday")}
                >
                  Kemarin
                </button>
                <button
                  type="button"
                  className="preset-btn active"
                  onClick={() => handlePreset("today")}
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => handlePreset("tomorrow")}
                >
                  Besok
                </button>
              </>
            )}
          </div>

          {/* Calendar / Month Header */}
          <div className="modern-datepicker-nav">
            <button
              type="button"
              className="nav-arrow-btn"
              onClick={prevMonth}
              title={isMonthOnly || viewMode === "months" ? "Tahun Sebelumnya" : "Bulan Sebelumnya"}
            >
              <IconChevronLeft size={16} />
            </button>

            <div className="nav-title-group">
              {!isMonthOnly && (
                <button
                  type="button"
                  className={`nav-title-btn ${viewMode === "months" ? "active" : ""}`}
                  onClick={() => setViewMode(viewMode === "months" ? "calendar" : "months")}
                >
                  {MONTH_NAMES[viewState.month]}
                </button>
              )}
              <button
                type="button"
                className={`nav-title-btn ${viewMode === "years" ? "active" : ""}`}
                onClick={() => setViewMode(viewMode === "years" ? (isMonthOnly ? "months" : "calendar") : "years")}
              >
                {viewState.year}
              </button>
            </div>

            <button
              type="button"
              className="nav-arrow-btn"
              onClick={nextMonth}
              title={isMonthOnly || viewMode === "months" ? "Tahun Berikutnya" : "Bulan Berikutnya"}
            >
              <IconChevronRight size={16} />
            </button>
          </div>

          {/* Month Selector Mode */}
          {viewMode === "months" && (
            <div className="modern-datepicker-months-grid">
              {MONTH_NAMES.map((mName, idx) => {
                const monthIso = toIsoMonthString(viewState.year, idx);
                const isSelected = isMonthOnly ? selectedStr === monthIso : idx === viewState.month;
                const isCurrentMonth = currentMonthStr === monthIso;

                return (
                  <button
                    key={mName}
                    type="button"
                    className={`month-cell ${isSelected ? "selected" : ""} ${isCurrentMonth && !isSelected ? "today" : ""}`}
                    onClick={() => {
                      if (isMonthOnly) {
                        handleSelectMonthOnly(idx);
                      } else {
                        setViewState(prev => ({ ...prev, month: idx }));
                        setViewMode("calendar");
                      }
                    }}
                  >
                    {mName.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Year Selector Mode */}
          {viewMode === "years" && (
            <div className="modern-datepicker-years-grid">
              {Array.from({ length: 16 }, (_, i) => viewState.year - 7 + i).map(yr => (
                <button
                  key={yr}
                  type="button"
                  className={`year-cell ${yr === viewState.year ? "selected" : ""}`}
                  onClick={() => {
                    setViewState(prev => ({ ...prev, year: yr }));
                    setViewMode(isMonthOnly ? "months" : "calendar");
                  }}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}

          {/* Calendar Grid Mode (Only when not isMonthOnly) */}
          {!isMonthOnly && viewMode === "calendar" && (
            <div className="modern-datepicker-calendar">
              <div className="calendar-weekdays">
                {DAY_NAMES.map(d => (
                  <span key={d} className="weekday-label">{d}</span>
                ))}
              </div>
              <div className="calendar-days">
                {getDaysGrid().map((item, idx) => {
                  const itemIso = toIsoString(item.year, item.month, item.day);
                  const isSelected = itemIso === selectedStr;
                  const isToday = itemIso === todayStr;

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`day-cell ${!item.isCurrentMonth ? "other-month" : ""} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                      onClick={() => handleSelectDate(item.year, item.month, item.day)}
                    >
                      <span>{item.day}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

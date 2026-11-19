import React, { useState, useRef, useEffect } from "react";
import { IconChevronDown, IconCheck } from "../../Icons";

/**
 * CustomDropdown
 * Pengganti native <select> dengan UI modern, animasi popover/fade-in halus,
 * search filter (opsional), auto close on outside click, dan dark mode.
 */
export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = "-- Pilih --",
  disabled = false,
  className = "",
  style = {},
  dropUp = false,
  searchable = false,
  searchPlaceholder = "Cari pilihan...",
  size = "md",
  title = "",
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setSearchQuery("");
  };

  const handleSelect = (opt) => {
    if (opt.disabled) return;
    if (onChange) {
      // Pass both event-like shape and value for seamless compatibility
      onChange({ target: { value: opt.value } });
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  const filteredOptions = searchable && searchQuery.trim() !== ""
    ? options.filter((opt) => {
        const text = typeof opt.label === "string" ? opt.label : String(opt.value);
        return text.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : options;

  return (
    <div
      ref={dropdownRef}
      className={`modern-custom-dropdown ${className} ${disabled ? "is-disabled" : ""} ${isOpen ? "is-open" : ""} size-${size}`}
      style={style}
      title={title}
    >
      {required && (
        <input
          type="text"
          value={value || ""}
          required
          onChange={() => {}}
          style={{
            position: "absolute",
            opacity: 0,
            width: 1,
            height: 1,
            pointerEvents: "none"
          }}
        />
      )}

      {/* Trigger Button */}
      <button
        type="button"
        className="modern-dropdown-trigger"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="modern-dropdown-selection">
          {selectedOption ? (
            <div className="modern-dropdown-selected-content">
              {selectedOption.icon && <span className="modern-dropdown-opt-icon">{selectedOption.icon}</span>}
              <span className="modern-dropdown-label-text">
                {selectedOption.label}
              </span>
              {selectedOption.badge && (
                <span className="modern-dropdown-opt-badge">{selectedOption.badge}</span>
              )}
            </div>
          ) : (
            <span className="modern-dropdown-placeholder">{placeholder}</span>
          )}
        </div>

        <span className={`modern-dropdown-arrow ${isOpen ? "is-rotated" : ""}`}>
          <IconChevronDown size={16} />
        </span>
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className={`modern-dropdown-menu ${dropUp ? "direction-up" : "direction-down"}`}>
          {searchable && (
            <div className="modern-dropdown-search-wrap">
              <input
                ref={searchInputRef}
                type="text"
                className="modern-dropdown-search-input"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="modern-dropdown-list custom-slim-scrollbar" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.key || opt.value || idx}
                    className={`modern-dropdown-item ${isSelected ? "is-selected" : ""} ${opt.disabled ? "is-disabled" : ""}`}
                    onClick={() => handleSelect(opt)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="modern-dropdown-item-left">
                      {opt.icon && <span className="modern-dropdown-opt-icon">{opt.icon}</span>}
                      <span className="modern-dropdown-item-text">{opt.label}</span>
                      {opt.badge && <span className="modern-dropdown-opt-badge">{opt.badge}</span>}
                    </div>
                    {isSelected && (
                      <span className="modern-dropdown-check-icon">
                        <IconCheck size={15} />
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="modern-dropdown-empty">Tidak ada pilihan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

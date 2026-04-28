import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "../css/MultiSelectDropdown.module.css";
import { ChevronDown, Check } from "lucide-react";

const MultiSelectDropdown = ({
  options = [],
  selected = [],
  onChange,
  placeholder = "Chọn danh mục",
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const ref = useRef();

  // Click outside (IMPORTANT: phải check cả portal)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();

      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }

    setOpen(!open);
  };

  const toggleSelect = (item) => {
    let newSelected;

    if (selected.find((s) => s.id === item.id)) {
      newSelected = selected.filter((s) => s.id !== item.id);
    } else {
      newSelected = [...selected, item];
    }

    onChange(newSelected);
  };

  return (
    <>
      {/* Trigger */}
      <div className={styles.wrapper} ref={ref}>
        <div className={styles.control} onClick={handleToggle}>
          <span>
            {selected.length > 0
              ? `Đã chọn ${selected.length} danh mục`
              : placeholder}
          </span>
          <ChevronDown size={18} className={open ? styles.rotate : ""} />
        </div>
      </div>

      {/* 🔥 DROPDOWN PORTAL */}
      {open &&
        createPortal(
          <div
            className={styles.dropdownPortal}
            style={{
              top: position?.top,
              left: position?.left,
              width: position?.width,
            }}
          >
            {options.length === 0 ? (
              <div className={styles.empty}>Không có dữ liệu</div>
            ) : (
              options.map((item) => {
                const isSelected = selected.some((s) => s.id === item.id);
                return (
                  <div
                    key={item.id}
                    className={`${styles.item} ${
                      isSelected ? styles.selected : ""
                    }`}
                    onClick={() => toggleSelect(item)}
                  >
                    <span>{item.categoryName || item.name}</span>
                    {isSelected && <Check size={16} />}
                  </div>
                );
              })
            )}
          </div>,
          document.body
        )}

      {/* Tags */}
      {selected.length > 0 && (
        <div className={styles.tags}>
          {selected.map((item) => (
            <div key={item.id} className={styles.tag}>
              {item.categoryName || item.name}
              <span onClick={() => toggleSelect(item)}>✕</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MultiSelectDropdown;
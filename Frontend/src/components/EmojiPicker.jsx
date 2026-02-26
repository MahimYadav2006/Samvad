import React, { useState, useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { SmileyIcon } from '@phosphor-icons/react';

function EmojiPicker({onEmojiSelect}) {
    const [pickerOpen, setPickerOpen] = useState(false);

    const pickerRef = useRef(null);
    const buttonRef = useRef(null);
    const colorMode = JSON.parse(window.localStorage.getItem("color-theme"));
    useEffect(() => {
        const handleClickOutside = (event) => {
            if ( // If it is clicked outside the picker and button then close the picker
                pickerOpen &&         
                pickerRef.current &&
                !pickerRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setPickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [pickerOpen]);

    const handleTrigger = (e) => {
        e.preventDefault();
        setPickerOpen((prev) => !prev);
    };

    return (
        <div className='relative flex'>
            <button type="button" ref={buttonRef} className='text-bodydark2 hover:text-primary' onClick={handleTrigger}>
                <SmileyIcon size={24} />
            </button>

            {pickerOpen && (
                <div ref={pickerRef}  className='absolute z-40 bottom-10 right-0 max-w-[92vw] overflow-auto rounded-xl'>
                    <Picker theme={colorMode} data={data} onEmojiSelect={onEmojiSelect} />
                </div>
            )}
        </div>
    );
}

export default EmojiPicker;

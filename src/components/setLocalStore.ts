import { useState, useEffect } from "react";

function getStorageValue<T>(key: string, defaultValue: T): T {
 const saved = localStorage.getItem(key);
 const initial = saved ? JSON.parse(saved) : defaultValue;
 return initial;
}

export const useLocalStorage = <T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
 const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
 });

 useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
 }, [key, value]);

 return [value, setValue];
};

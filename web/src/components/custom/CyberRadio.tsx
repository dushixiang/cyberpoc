import {useState} from 'react';
import './CyberRadio.css'

export interface CyberRadioCardProp {
    name: string
    emoji: string
    value: string
    onClick: (value: string) => void
    checked: boolean
}

const RadioCard = (prop: CyberRadioCardProp) => {

    const handleChange = (v: string) => {
        prop.onClick(v);
    }

    return (
        <div className="radio-wrapper">
            <input className="input" name="btn" type="radio"
                   checked={prop.checked}
                   onChange={() => {
                       handleChange(prop.value)
                   }}
            />
            <div className="btn" onClick={() => prop.onClick(prop.value)}>
                <span aria-hidden="true" role="img" className="text-sm">{prop.emoji}</span>
                <span aria-hidden="true">{prop.name}</span>
                <span className="btn__glitch" aria-hidden="true">{prop.name}</span>
                <label className="number">r{prop.value}</label>
            </div>
        </div>
    );
};

interface RadioGroupProp {
    onChange: (value: string) => void
    items: any[]
    checked: any
}

const CyberRadio = (prop: RadioGroupProp) => {
    let _items = prop.items.map(item => {
        item.checked = item.value == prop.checked;
        return item;
    });
    let [items, setItems] = useState(_items);

    let [flush, setFlush] = useState(false);

    const onRadioCardClick = (value: string) => {
        for (let item of items) {
            item.checked = item.value === value;
        }
        setItems(items);
        setFlush(!flush);
        prop.onChange(value);
    }

    return (
        <div className="flex flex-wrap items-end gap-2">
            {
                items.map(item => {
                    return <RadioCard
                        key={item.value}
                        checked={item.checked}
                        emoji={item.emoji}
                        name={item.name}
                        value={item.value}
                        onClick={onRadioCardClick}
                    />
                })
            }
        </div>
    );
};

export default CyberRadio;
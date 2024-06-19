import React, { useContext } from 'react'
import { Select, Form} from 'antd'

import Flag from 'react-flagkit';

// 定义 Context中的数据类型
interface LanguageType {
  targetLanguage: string
  updateTargetLanguage: (name: string) => void;
}

// 创建 Context
export const LanguageContext = React.createContext<LanguageType | undefined>(undefined);

const LanguageBar = () => {
    const languageContext = useContext(LanguageContext);

    function handleChange(value: string) {
        languageContext?.updateTargetLanguage(value);
    }

    return (
        <Form>
        <Form.Item name="select" initialValue={"英语"}>
          <Select style={{ width: 120, top: 13 }} onChange={handleChange}>
            <Select.Option value="英语"><Flag country='GB'></Flag> 英语</Select.Option>
            <Select.Option value="法语"><Flag country='FR'></Flag> 法语</Select.Option>
            <Select.Option value="日语"><Flag country='JP'></Flag> 日语</Select.Option>
            <Select.Option value="德语"><Flag country='DE'></Flag> 德语</Select.Option>
            <Select.Option value="西班牙语"><Flag country='ES'></Flag> 西班牙语</Select.Option>
            <Select.Option value="俄语"><Flag country='RU'></Flag> 俄语</Select.Option>
          </Select>
        </Form.Item>
        </Form>
      );
}


export default LanguageBar
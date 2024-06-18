import React, { useContext } from 'react'
import { Select, Form} from 'antd'

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
        <Form.Item
          name="select"
        >
          <Select defaultValue="英语" style={{ width: 120, top: 13 }} onChange={handleChange}>
            <Select.Option value="英语">英语</Select.Option>
            <Select.Option value="法语">法语</Select.Option>
          </Select>
        </Form.Item>
        </Form>
      );
}


export default LanguageBar
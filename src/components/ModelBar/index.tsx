import React, { useContext, useState } from 'react'
import { Select, Form, Input } from 'antd'

// 定义 Context中的数据类型
interface ModelType {
  model: string
  updateModel: (modelName: string) => void;
}

// 创建 Context
export const ModelContext = React.createContext<ModelType | undefined>(undefined);

const ModelBar = () => {
  const modelContext = useContext(ModelContext);
  const [validateStatus, setValidateStatus] = useState<'error' | ''>('')
  const [validateMsg, setValidateMsg] = useState<string | undefined>(undefined)

  return (
    <Form layout='horizontal'>
      <Form.Item initialValue={modelContext?.model} validateStatus={validateStatus}>
        <Input defaultValue={modelContext?.model} placeholder='AI Model' style={{ width: 120, top: 13, marginRight: 10 }} onChange={(e) => {
          // validation for model name.
          let modelName = e.target.value;
          if (modelName.startsWith('claude')) {
            setValidateStatus('error')
            setValidateMsg('Claude models are not supported yet.')
            return
          }
          modelContext?.updateModel(e.target.value);
          setValidateStatus('');
        }}></Input>
      </Form.Item>
    </Form>
  );
}


export default ModelBar
import ChatGPT from '@/components/ChatGPT'
import { Layout } from 'antd'
import { Content } from 'antd/lib/layout/layout'

import FooterBar from '@/components/FooterBar'
import HeaderBar from '@/components/HeaderBar'

import styles from './index.module.less'
import { useState } from 'react'
import LanguageBar, { LanguageContext } from '@/components/LanguageBar'
import { ModelContext } from '@/components/ModelBar'

export default function Home() {
  const [targetLanguage, setTargetLanguage] = useState({targetLanguage: '英文'});
  const [model, setModel] = useState({model: 'gpt-3.5-turbo'});
  
  const updateTargetLanguage = (targetLanguage: string) => {
    setTargetLanguage({targetLanguage: targetLanguage});
  };

  const updateModel = (model: string) => {
    setModel({model: model});
  };

  return (
    <LanguageContext.Provider value={{ ...targetLanguage, updateTargetLanguage }}>
    <ModelContext.Provider value={{...model, updateModel}}>
      <Layout hasSider className={styles.layout}>
        <Layout>
          <HeaderBar />
          <Content className={styles.main}>
            <ChatGPT fetchPath="/api/chat-completion" />
          </Content>
          <FooterBar />
        </Layout>
      </Layout>
    </ModelContext.Provider>
    </LanguageContext.Provider>
  )
}

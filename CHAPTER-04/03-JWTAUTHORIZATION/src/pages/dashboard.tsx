import Router from 'next/router'
import { useEffect } from 'react'
import { Can } from '../components/Can'
import { useAuthContext } from '../context/useAuthContext'
import { Api } from '../services/Api'
import { setupAPIClient } from '../services/setupAPIClient'

import { withSSRAuth } from '../utils/withSSRAuth'

import styles from '../styles/Home.module.css'
import { ButtonSignOut } from '../components/ButtonSignOut'

export default function Dashboard() {
  const { user } = useAuthContext()

  useEffect(() => {
    Api.get('/me')
      .then((response) => console.log(response))
      .catch((err) => console.log(err))
  }, [])

  return (
    <>
      <h1>Hi, {user?.email}!</h1>

      <br />

      <Can roles={['administrator']}>{<h3>You are an admin</h3>}</Can>

      <br />

      <Can permissions={['metrics.list', 'users.list']}>
        {<h3>You has permissions to see metrics</h3>}
      </Can>

      <button className={styles.btn} onClick={() => Router.push('/metrics')}>
        Go to metrics
      </button>

      <ButtonSignOut />
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (context) => {
  const ApiClient = setupAPIClient(context)
  const response = await ApiClient.get('/me')

  return {
    props: {},
  }
})

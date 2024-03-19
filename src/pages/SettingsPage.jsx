import { DefaultLayout } from '../layouts/DefaultLayout'

export { SettingsPage }

function SettingsPage(props) {

  const onSubmit = (ev) => {
    ev.preventDefault()

    const form = ev.target
    const serverData = Object.fromEntries(new FormData(form))

    localStorage.setItem('SERVER_URL', serverData.server_url)
    localStorage.setItem('SERVER_KEY', serverData.server_token)
  }

  return (
    <DefaultLayout>
      <div className='container mx-auto'>
        <section className='row'>
          <h1 className='fs-3 fw-semibold mb-4'>App settings</h1>
        </section>
        
        <form onSubmit={onSubmit}>
          <fieldset>
            <div className='row mb-2'>
              <div className='col-2'>
                <h3 className='fs-6 fw-semibold'>Server URL</h3>
              </div>
              <div className='col-10'>
                <div className='form-floating'>
                  <input name='server_url' className='form-control' id='serverUrlInput' required defaultValue={localStorage.getItem('SERVER_URL')} />
                  <label htmlFor='serverUrlInput' className='form-label'>(e.g. https://despos-xxxx-xxxx-xxxx.romvales.com)</label>
                </div>
              </div>
            </div>
            <div className='row mb-2'>
              <div className='col-2'>
                <h3 className='fs-6 fw-semibold'>Server Token</h3>
              </div>
              <div className='col-10'>
                <div className='form-floating'>
                  <input name='server_token' type='password' className='form-control' id='serverTokenInput' required defaultValue={localStorage.getItem('SERVER_KEY')} />
                  <label htmlFor='serverTokenInput' className='form-label'>Put the private token provided to you here</label>
                </div>
              </div>
            </div>
          </fieldset>

          <div className='d-flex justify-content-end'>
            <button type='submit' className='btn btn-primary'>Save</button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  )
}
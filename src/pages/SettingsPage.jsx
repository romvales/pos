import { createRef, useEffect, useState } from 'react'
import { DefaultLayout } from '../layouts/DefaultLayout'
import { Link } from 'react-router-dom'

export { SettingsPage }

const videoInputs = (await navigator.mediaDevices.enumerateDevices()).filter(device => device.kind == 'videoinput')

function SettingsPage(props) {
  const [devices, setDevices] = useState(videoInputs)
  const defaults = {
    server_url: localStorage.getItem('SERVER_URL'),
    server_token: localStorage.getItem('SERVER_KEY'),
    video_input: JSON.parse(localStorage.getItem('VIDEO_INPUT')) ?? {},
  }

  const onSubmit = (ev) => {
    ev.preventDefault()

    const form = ev.target
    const serverData = Object.fromEntries(new FormData(form))

    localStorage.setItem('SERVER_URL', serverData.server_url)
    localStorage.setItem('SERVER_KEY', serverData.server_token)
    localStorage.setItem('VIDEO_INPUT', JSON.stringify(videoInputs[serverData.video_input]))
    window.location.reload()
  }

  const Breadcrumbs = () => (
    <nav aria-label='breadcrumb'>
      <ol className='breadcrumb'>
        <li className='breadcrumb-item'>
          <Link className='' to={{ pathname: '/' }}>Home</Link>
        </li>
        <li className='breadcrumb-item active' aria-current='page'>Settings</li>
      </ol>
    </nav>
  )

  return (
    <DefaultLayout Breadcrumbs={Breadcrumbs}>
      <div className='container mx-auto'>
        <Breadcrumbs />

        <section className='row mb-2'>
          <h1 className='fs-3 fw-semibold mb-4'>App settings</h1>
        </section>

        <section className='row'>
          <nav className='col-3 flex-grow-1'>
            <p className='text-secondary'>Update your settings here.</p>
          </nav>

          <div className='col-9'>
            <form onSubmit={onSubmit}>
              <fieldset>
                <div className='row mb-2'>
                  <div className='col-2'>
                    <h3 className='fs-6 fw-semibold'>Server URL</h3>
                  </div>
                  <div className='col-10'>
                    <div className='form-floating'>
                      <input name='server_url' className='form-control' id='serverUrlInput' defaultValue={defaults.server_url} />
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
                      <input name='server_token' type='password' className='form-control' id='serverTokenInput' defaultValue={defaults.server_token} />
                      <label htmlFor='serverTokenInput' className='form-label'>Put the private token provided to you here</label>
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <div className='row mb-2'>
                  <div className='col-2'>
                    <h3 className='fs-6 fw-semibold'>Video Devices</h3>
                  </div>
                  <div className='col-10'>
                    <ul className='list-unstyled d-flex gap-2'>
                      {
                        videoInputs.map((video, i) => {
                          return (
                            <li key={i} className='flex-grow-1'>
                              <div className='form-check'>
                                <input className='form-check-input' type='radio' value={i} name={`video_input`} id={`videoInput${i + 1}`} defaultChecked={videoInputs[i].deviceId == defaults.video_input.deviceId} />
                                <label className='form-check-label' htmlFor={`videoInput${i + 1}`}>
                                  {videoInputs[i].label.length ? videoInputs[i].label : `Video Source ${i + 1}`}
                                </label>
                              </div>
                            </li>
                          )
                        })
                      }
                    </ul>
                  </div>
                </div>
              </fieldset>

              <div className='d-flex justify-content-end'>
                <button type='submit' className='btn btn-primary'>Save</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </DefaultLayout>
  )
}
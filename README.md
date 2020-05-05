# geoflux
New implementation of geoFluxus website

## Local Installation
### Clone repo
If you have Git or any other related software ([GitHub Desktop](https://desktop.github.com/), [GitKraken](https://www.gitkraken.com/) etc.), clone the repo in your computer with the command:

```(git clone) https://github.com/VasileiosBouzas/geoflux.git```

### Backend 
Make sure that [Python3](https://www.python.org/downloads/) is installed in your computer. To check that, open a terminal and insert the command:

```python -version```

If the command is recognized, the currentrly installed version of Python should appear in your screen. Once you have verified that Python3 is properly installed, enter the following command to download the necessary dependencies:

```python3 install -r requirements.txt```

(If you wish to set up a Python virtual environment instead, please check the instructions [here](https://docs.python.org/3/tutorial/venv.html)).

**ATTENTION!**: Backend depends upon certain geodata libraries for which some extra steps are necessary to configure them in different operating systems (for more info, please visit this [page](https://docs.djangoproject.com/en/3.0/ref/contrib/gis/install/).

- Windows: To assure that you have all the necessary supporting files for the geodata libraries, please install [OSGEO4W](https://trac.osgeo.org/osgeo4w/) in your **C:** drive.

- macOS: To assure that you have all the necessary supporting files for the geodata libraries, please use the following commands:
  
  ```
  $ brew install postgresql
  $ brew install postgis
  $ brew install gdal
  $ brew install libgeoip
  ```

### Frontend
To install the frontend dependencies, [Yarn](https://classic.yarnpkg.com/en/docs/install/#windows-stable) is needed (check the currently installed version in your computer by using the command *yarn version* in terminal. Once installed, run *yarn install* to download all the dependencies listed in package.json.
